/* eslint-env jest */
/* global withStory */
import { query as Q, queryAll as QQ } from "../query.js";
import { InformObject } from "../InformTypes.js";

const attributesStory = `"Attributes" by Florian.

The test room is a room.
The other test room is a room.

The test door is a door.
The test door is north of the test room and south of the other test room.
The test door is closed and locked.

The test door can be broken or unbroken. The test door is unbroken.`;

withStory(attributesStory, () => {
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
