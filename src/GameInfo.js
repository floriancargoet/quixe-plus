import {
  objectIDToName,
  attributeIDToName,
  propertyIDToName,
} from "./utils.js";
import { VM } from "./VM.js";

class GameInfo {
  objectsByValue = {};
  arraysByValue = {};
  objectIDsByName = {};
  attributeIDsByName = {};
  propertyIDsByName = {};

  init(gameinfo) {
    Object.assign(this, gameinfo);
    // Reverse the object & array maps
    Object.keys(this.objectsByID).forEach((id) => {
      const value = this.getObjectValueByID(id);
      this.objectsByValue[value] = id;
    });
    Object.keys(this.arraysByID).forEach((id) => {
      const array = this.getArrayByID(id);
      const value = array[0];
      this.arraysByValue[value] = array;
    });

    // Build maps by name
    Object.keys(this.objectsByID).forEach((id) => {
      this.objectIDsByName[objectIDToName(id)] = id;
    });
    Object.keys(this.attributesByID).forEach((id) => {
      this.attributeIDsByName[attributeIDToName(id)] = id;
    });
    Object.keys(this.propertiesByID).forEach((id) => {
      this.propertyIDsByName[propertyIDToName(id)] = id;
    });
  }

  getType(value) {
    if (this.objectsByValue[value]) {
      return "object";
    }
    if (this.arraysByValue[value]) {
      return "array";
    }

    return "unknown";
  }

  getGlobalValueByID(id) {
    const addr = this.globalsByID[id];
    return VM.getGlobal(addr); // value
  }

  getObjectValueByID(id) {
    return this.objectsByID[id]; // value
  }

  getObjectIDByValue(value) {
    return this.objectsByValue[value]; // id
  }

  getObjectIDByName(name) {
    return this.objectIDsByName[name]; // id
  }

  getArrayByID(id) {
    return this.arraysByID[id]; // array
  }

  getArrayByValue(value) {
    return this.arraysByValue[value]; // array
  }

  getPropertyValueByID(id) {
    return this.propertiesByID[id]; // value
  }

  getPropertyIDByName(name) {
    return this.propertyIDsByName[name]; // id
  }

  getAttributeValueByID(id) {
    return this.attributesByID[id]; // value
  }

  getAttributeIDByName(name) {
    return this.attributeIDsByName[name]; // id
  }
}

// instance
let gameinfo = new GameInfo();
if (window.gameinfo) {
  gameinfo.init(window.gameinfo);
}

export { gameinfo };
