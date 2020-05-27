/* eslint-env node */
const xml2js = require("xml2js");

module.exports = function convertGameInfo(xmlString) {
  const parser = new xml2js.Parser();
  let gameinfo;

  // despite taking a callbacj, parseString is synchronous
  parser.parseString(xmlString, function (error, result) {
    if (error) {
      throw error;
    }

    function firstStringMapper(key) {
      return (item) => {
        const nodeValue = item[key][0];
        return nodeValue._ || nodeValue; // if node has attributes, name is in _, otherwise node == name
      };
    }
    function firstIntegerMapper(key) {
      return (item) => {
        const nodeValue = item[key][0];
        return parseInt(nodeValue._ || nodeValue);
      };
    }
    function arrayMapper() {
      return (item) => [
        parseInt(item["value"][0]),
        parseInt(item["byte-count"][0]),
        parseInt(item["bytes-per-element"][0]),
        "true" === item["zeroth-element-holds-length"][0],
      ];
    }

    function makeMap(
      nodeType,
      getItem = firstIntegerMapper("value"),
      getKey = firstStringMapper("identifier")
    ) {
      const map = {};
      result["inform-story-file"][nodeType].forEach((item) => {
        const key = getKey(item);
        if (typeof key === "string") {
          map[key] = getItem(item);
        }
      });
      return map;
    }

    gameinfo = {
      globalsByID: makeMap("global-variable", firstIntegerMapper("address")),
      objectsByID: makeMap("object"),
      propertiesByID: makeMap("property"),
      attributesByID: makeMap("attribute"),
      arraysByID: makeMap("array", arrayMapper()),
      classesByID: makeMap("class")
    };
  });

  return gameinfo;
};
