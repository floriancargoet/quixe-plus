// public
import * as Types from "./InformTypes.js";
import { SVGMap } from "./maps/SVGMap.js";
import { query, queryAll } from "./query.js";
import { Updater } from "./Updater.js";
import { Player } from "./Player.js";
// exposed internal
import { gameinfo } from "./GameInfo.js";
import { VM } from "./VM.js";

export default function QuixePlus(q) {
  return query(q);
}

Object.assign(QuixePlus, Types, {
  version: "0.0.1",
  all: queryAll,
  mergeAttrMap: Types.InformObject.mergeAttrMap,
  Updater,
  Player,
  SVGMap,
  internals: {
    gameinfo,
    VM
  }
});

// Short aliases
window.QQ = queryAll;
window.Q = query;
