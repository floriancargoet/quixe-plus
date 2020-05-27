import { gameinfo } from "./GameInfo.js";
import { InformValue, InformArray, InformObject } from "./InformTypes.js";

export function query(q) {
  return queryAll(q)[0] || null;
}

/*
Gettable things
- objects
  - attributes
  - properties
- arrays
  - items
- globals

Later?
- constant
- table-entry

*/

const excludePatterns = [
  /nothing/,
  /Compass/,
  /thedark/,
  /InformParser/,
  /InformLibrary/,
  /property_numberspace_forcer/,
  /ValuePropertyHolder_[\d]+/,
  /selfobj/,
];

function excludeInformDefaultObjects(name) {
  return !excludePatterns.some((pattern) => pattern.test(name));
}

export function queryAll(q) {
  let results = [];
  if (typeof q !== "string") {
    throw new Error("query must be a string");
  }
  try {
    if (q === "**") {
      // get all objects
      results = Object.keys(gameinfo.objectsByID).map((id) =>
        InformObject.create(id)
      );
    } else if (q === "*") {
      // get all objects but exclude Inform default objects
      results = Object.keys(gameinfo.objectsByID)
        // filter by name
        .filter(excludeInformDefaultObjects)
        .map((id) => InformObject.create(id))
        // filter 12 compass directions
        .filter((obj) => !(obj.parent && obj.parent.id === "Compass"));
    } else {
      const first = q.charAt(0);
      const rest = q.slice(1);
      if (first === ".") {
        const attrs = rest.split(",");
        results = queryAll("*").filter((o) =>
          attrs.every((attr) => o.is(attr))
        );
      } else {
        const objectID = gameinfo.getObjectIDByName(q);
        if (objectID) {
          results.push(InformObject.create(objectID));
        }
        const array = InformArray.create(q);
        if (array) {
          results.push(array);
        }
        const globalValue = gameinfo.getGlobalValueByID(q);
        if (globalValue) {
          results.push(InformValue.create(globalValue));
        }
      }
    }
  } catch (e) {
    results = [];
  }
  return results;
}
