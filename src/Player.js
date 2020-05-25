import { gameinfo } from "./GameInfo.js";
import { InformObject } from "./InformTypes.js";

export class Player extends InformObject {
  constructor() {
    const value = gameinfo.getGlobalValueByID("player");
    const id = gameinfo.getObjectIDByValue(value);
    super(id, value);
  }

  get location() {
    return InformObject.create(gameinfo.getGlobalValueByID("real_location"));
  }

  get inventory() {
    return this.children;
  }

  has(name) {
    let found = false;
    this.traverse((obj) => {
      if (obj.name === name) {
        found = true;
      }
    });
    return found;
  }
}
