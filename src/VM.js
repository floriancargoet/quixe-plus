if (!globalThis.Quixe) {
  throw new Error("Missing global Quixe");
}

const vm_internals = globalThis.Quixe.get_vm_internals();

if (!vm_internals.getConstantString) {
  throw new Error("Missing Quixe modification getConstantString()");
}

const OBJECT_TYPE = 0x70;

// Functions adapted from http://blog.zarfhome.com/2015/06/customizing-interpreter-for-glulx-game.html
export const VM = {
  read1(addr) {
    return vm_internals.Mem1(addr);
  },

  read2(addr) {
    return vm_internals.Mem2(addr);
  },

  read4(addr) {
    return vm_internals.Mem4(addr);
  },

  getConstantString(addr) {
    return vm_internals.getConstantString(addr);
  },

  // Byte 1
  getType(obj) {
    return this.read1(obj); // should always be 0x70
  },

  // Bytes 2-7
  // Look up an attribute flag on an object.
  getObjectAttribute(obj, attr) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;

    const byte = this.read1(obj + 1 + (attr >> 3));
    if (byte & (1 << (attr & 7))) return true;
    else return false;
  },

  // Bytes 8-11
  // next in the linked list
  getObjectNext(obj) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;
    return this.read4(obj + 8);
  },

  // Bytes 12-15
  getObjectHarwardName(obj) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;
    const nameAddr = this.read4(obj + 12);
    return this.getConstantString(nameAddr);
  },

  // Bytes 16-19
  // Look up a property value on an object.
  /* Returns the first word of the property, if multi-word. (In most I7 games,
      the only multi-word property is "name". So you can't use this function
      to scan through the name list of an object.) */
  getObjectProperty(obj, prop) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;

    const proptab = this.read4(obj + 16);
    const propcount = this.read4(proptab + 0);
    for (let ix = 0; ix < propcount; ix++) {
      const propent = proptab + 4 + ix * 10;
      const pid = this.read2(propent + 0);
      if (pid == prop) {
        const paddr = this.read4(propent + 4);
        return this.read4(paddr);
      }
    }

    // Property not provided.
    return null;
  },

  // Bytes 20-23
  getObjectParent(obj) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;
    return this.read4(obj + 20);
  },

  // Bytes 24-27
  getObjectSibling(obj) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;
    return this.read4(obj + 24);
  },

  // Bytes 28-31
  getObjectFirstChild(obj) {
    if (this.getType(obj) !== OBJECT_TYPE) return null;
    return this.read4(obj + 28);
  },
};
