/* eslint-env jest */
/* global withStory */
const { query: Q, queryAll: QQ } = require("../query.js");
const { InformObject } = require("../InformTypes.js");

withStory("attributes", () => {
  test(".locked", () => {
    expect(QQ(".locked")).toHaveLength(1);
  });

  test("negation", () => {
    const total = QQ("*").length;
    expect(QQ(".!locked")).toHaveLength(total - 1);
  });

  test("predefined negation", () => {
    const total = QQ("*").length;
    expect(QQ(".unlocked")).toHaveLength(total - 1);
  });

  test("custom attribute", () => {
    InformObject.mergeAttrMap({
      // requires story support
      unbroken: "!broken",
    });
    expect(Q("test_door").is("unbroken")).toBe(true);
    expect(Q("test_door").is("!broken")).toBe(true);
    expect(Q("test_door").is("broken")).toBe(false);
    expect(Q("test_door").is("!unbroken")).toBe(false);
  });
});
