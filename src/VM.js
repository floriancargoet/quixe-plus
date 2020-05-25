if (!window.Quixe) {
  throw new Error("Missing global Quixe");
}

const vm_internals = window.Quixe.get_vm_internals();

if (!vm_internals.getConstantString) {
  throw new Error("Missing Quixe modification getConstantString()");
}

// Raw access to VM memory
// We don't have access to the private memmap array but we can each item with Mem1.
function memmap(addr) {
  return vm_internals.Mem1(addr);
}

// Functions adapted from http://blog.zarfhome.com/2015/06/customizing-interpreter-for-glulx-game.html
export const VM = {
  read1(/* glui32 */ addr) {
    return vm_internals.Mem1(addr);
  },

  read4(/* glui32 */ addr) {
    return vm_internals.Mem4(addr);
  },

  getGlobal(/* glui32 */ addr) {
    return vm_internals.Mem4(addr);
  },

  getParent(/* glui32 */ obj) {
    if (memmap(obj) !== 0x70) return null; // error: called getParent on a non-object
    return vm_internals.Mem4(obj + 5 * 4);
  },

  getFirstChild(/* glui32 */ obj) {
    if (memmap(obj) !== 0x70) return null; // error: called getFirstChild on a non-object
    return vm_internals.Mem4(obj + 7 * 4);
  },

  getSibling(/* glui32 */ obj) {
    if (memmap(obj) !== 0x70) return null; // error: called getSibling on a non-object
    return vm_internals.Mem4(obj + 6 * 4);
  },

  // Look up an attribute flag on an object.
  getAttribute(/* glui32 */ obj, /* int */ attr) {
    if (memmap(obj) !== 0x70) return null; // error: called getAttribute on a non-object

    const byte = memmap(obj + 1 + (attr >> 3));
    if (byte & (1 << (attr & 7))) return true;
    else return false;
  },

  // Look up a property value on an object.
  /* Returns the first word of the property, if multi-word. (In most I7 games,
      the only multi-word property is "name". So you can't use this function
      to scan through the name list of an object.) */
  getProperty(/* glui32 */ obj, /* int */ prop) {
    if (memmap(obj) !== 0x70) return null; // error: called getProperty on a non-object

    const proptab = vm_internals.Mem4(obj + 16);
    const propcount = vm_internals.Mem4(proptab + 0);
    for (let ix = 0; ix < propcount; ix++) {
      const propent = proptab + 4 + ix * 10;
      const pid = vm_internals.Mem2(propent + 0);
      if (pid == prop) {
        const paddr = vm_internals.Mem4(propent + 4);
        return vm_internals.Mem4(paddr);
      }
    }

    // Property not provided.
    return null;
  },

  getConstantString(addr) {
    return vm_internals.getConstantString(addr);
  },
};
