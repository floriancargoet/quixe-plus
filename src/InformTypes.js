import { gameinfo } from "./GameInfo.js";
import { VM } from "./VM.js";
import { objectIDToName, classIDToName } from "./utils.js";

export class InformValue {
  value = 0;
  static create(value) {
    return new InformValue(value);
  }

  constructor(value) {
    this.value = value;
  }

  asArray() {
    return InformArray.create(this.value);
  }

  asString() {
    return InformString.create(this.value);
  }

  asObject() {
    return InformObject.create(this.value);
  }

  getValue() {
    return this.value;
  }
}

export class InformArray extends InformValue {
  static create(idOrValue, Class = InformArray) {
    let arrayInfo;
    if (idOrValue == null) {
      arrayInfo = null;
    }
    if (typeof idOrValue === "string") {
      arrayInfo = gameinfo.getArrayByID(idOrValue);
    } else {
      arrayInfo = gameinfo.getArrayByValue(idOrValue);
    }

    if (arrayInfo) {
      return new Class(arrayInfo);
    }
    return null;
  }

  constructor([value, byteCount, bytesPerElement, zerothHasLength]) {
    const address = value;
    if (bytesPerElement !== 1 && bytesPerElement !== 4) {
      throw new Error(
        "Unsupported array: " +
          JSON.stringify({
            address,
            byteCount,
            bytesPerElement,
            zerothHasLength,
          })
      );
    }
    super(value);
    this.address = address;
    this.byteCount = byteCount;
    this.bytesPerElement = bytesPerElement;
    this.length = byteCount / bytesPerElement;
    this.zerothHasLength = zerothHasLength;
  }

  atRaw(n) {
    if (n < 0 || n > this.length) {
      return null;
    }
    if (this.bytesPerElement === 1) {
      return VM.read1(this.address + n);
    }
    if (this.bytesPerElement === 4) {
      return VM.read4(this.address + n * 4);
    }
  }

  at(n, Class) {
    const value = this.atRaw(n);
    if (Class === String) {
      return InformString.create(value).toString();
    }
    if (Class && Class.create) {
      return Class.create(value);
    } else if (Class) {
      return new Class(value); // needed?
    }
    return value;
  }

  toJSArray() {
    const array = [];
    for (let i = 0; i < this.length; i++) {
      array.push(this.atRaw(i));
    }
    return array;
  }
}

export class InformString extends InformArray {
  // strings are arrays whose 2nd item is the string address
  static create(idOrValue) {
    return InformArray.create(idOrValue, InformString);
  }

  toString() {
    const stringAddress = this.atRaw(1);
    return VM.getConstantString(stringAddress);
  }
}

export class InformObject extends InformValue {
  /*
  byte: 70 (type identifier for objects)
  byte[7]: attributes
  long: next object in the overall linked list
  long: hardware name string
  long: property table address
  long: parent object
  long: sibling object
  long: child object
  */
  id = "";
  name = "";

  static attrMap = {
    // alternative form of inform attributes
    person: "animate",
    clothing: "wearable",
    undescribed: "concealed",
    inedible: "!edible",
    dark: "!light",
    unlockable: "!lockable",
    unlocked: "!locked",
    handled: "moved",
    off: "!on",
    closed: "!open",
    "fixed in place": "static",
    portable: "!static",
    device: "switchable",
    opaque: "!transparent",
    // convenient aliases
    room: "mark_as_room",
    thing: "mark_as_thing",
    lit: "light",
  };

  // Add your own map by called InformObject.mergeAttrMap() or QuixePlus.mergeAttrMap()
  static mergeAttrMap(attrMap) {
    Object.assign(InformObject.attrMap, attrMap);
  }

  static create(idOrValue) {
    let id, value;
    if (idOrValue == null) {
      id = "nothing";
    }
    if (typeof idOrValue === "string") {
      id = idOrValue;
    } else {
      value = idOrValue;
    }
    id = id || gameinfo.getObjectIDByValue(value);
    value = value || gameinfo.getObjectValueByID(id);
    if (id == null || value == null) {
      return InformObject.create("nothing");
    }
    return new InformObject(id, value);
  }

  constructor(id, value) {
    if (id == null || value == null) {
      throw new Error("Incorrect object creation");
    }
    super(value);
    this.id = id;
    this.name = objectIDToName(this.id);
  }

  get kind() {
    return this.getProperty("inheritance class", InformClass);
  }

  get kinds() {
    const hierarchy = InformArray.create("KindHierarchy").toJSArray();
    const hierarchyMap = {};
    hierarchy.forEach((kind, i) => {
      if (i % 2 === 0) {
        const superKind = hierarchy[hierarchy[i + 1] * 2];
        hierarchyMap[kind] = superKind;
      }
    });

    const kinds = [];
    let kind = this.getProperty("inheritance class"),
      lastKind;
    while (kind !== lastKind) {
      kinds.push(kind);
      lastKind = kind;
      kind = hierarchyMap[kind];
    }
    return kinds.map((k) => InformClass.create(k));
  }

  get children() {
    const children = [];
    let firstChild = VM.getObjectFirstChild(this.value);
    if (firstChild) {
      let child = firstChild;
      while (child) {
        children.push(InformObject.create(child));
        child = VM.getObjectSibling(child);
      }
    }
    return children;
  }

  get parent() {
    const value = VM.getObjectParent(this.value);
    return value ? InformObject.create(value) : null;
  }

  getProperty(propName, Class) {
    const propID = gameinfo.getPropertyIDByName(propName);
    if (!propID) return null;
    const value = VM.getObjectProperty(
      this.value,
      gameinfo.getPropertyValueByID(propID)
    );
    if (Class === String) {
      return InformString.create(value).toString();
    }
    if (Class && Class.create) {
      return Class.create(value);
    } else if (Class) {
      return new Class(value); // needed?
    }
    return value;
  }

  printAllProperties() {
    const propsStart = VM.read4(this.value + 16); // address where properties start
    const propCount = VM.read4(propsStart + 0); // number of properties at relative address 0
    for (let i = 0; i < propCount; i++) {
      const propStart = propsStart + 4 + i * 10; // address where this property starts
      const propID = VM.read2(propStart + 0); // numeric id of the property (called value in gameinfo)
      const propAddr = VM.read4(propStart + 4);
      const propValue = VM.read4(propAddr);
      const propName = gameinfo.propertyIDsByValue[propID];
      console.log(propID, propName, propValue, propStart);
    }
  }

  printAllAttributes() {
    Object.keys(gameinfo.attributesByID).forEach((attrID) => {
      const attrValue = gameinfo.getAttributeValueByID(attrID);
      const attribute = Boolean(VM.getObjectAttribute(this.value, attrValue));
      const byte = 1 + (attrValue >> 3);
      const bit = attrValue & 7;
      console.log(attrID, attribute, byte, bit);
    });
  }

  getAttribute(attrName) {
    const attrID = gameinfo.getAttributeIDByName(attrName);
    if (!attrID) return null;
    return Boolean(
      VM.getObjectAttribute(this.value, gameinfo.getAttributeValueByID(attrID))
    );
  }

  is(attrName) {
    // check is the attr is remapped and/or negated
    let negated = false;
    if (attrName.charAt(0) === "!") {
      negated = !negated;
      attrName = attrName.slice(1);
    }
    attrName = InformObject.attrMap[attrName] || attrName;
    // the mapping could result in another negation

    if (attrName.charAt(0) === "!") {
      negated = !negated;
      attrName = attrName.slice(1);
    }

    const result = this.getAttribute(attrName);
    return negated ? !result : result;
  }

  traverse(fn) {
    function traverse(node) {
      fn(node);
      for (let child of node.children) {
        traverse(child);
      }
    }
    traverse(this);
  }
}

// Classes have the same structure as objects
export class InformClass extends InformObject {
  static create(idOrValue) {
    if (idOrValue == null) {
      throw new Error("Invalid InformClass");
    }
    let id, value;
    if (typeof idOrValue === "string") {
      id = idOrValue;
    } else {
      value = idOrValue;
    }
    id = id || gameinfo.getClassIDByValue(value);
    value = value || gameinfo.getClassValueByID(id);
    if (id == null || value == null) {
      throw new Error("Invalid InformClass");
    }
    return new InformClass(id, value);
  }

  constructor(id, value) {
    if (id == null || value == null) {
      throw new Error("Incorrect class creation");
    }
    super(id, value);
    this.name = classIDToName(this.id);
  }
}
