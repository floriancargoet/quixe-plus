/* eslint-env jest */
/* global withStory */
const QuixePlus = require("../QuixePlus.js").default;
const { query: Q } = require("../query.js");

const objectStory = `"Object" by Florian.

The test room is a room.
A chest is a kind of container.
A chest can be metal or wooden.
A chest is usually metal.
A chest has a number called weight.

The iron chest is a chest in the test room.
The iron chest has a text called size.
The size of the iron chest is "small".
The weight of the iron chest is 40.

The oak chest is a wooden chest.
The book is in the oak chest.
`;

withStory(objectStory, () => {

  test("we can get an object", () => {
    expect(Q("iron_chest")).toBeTruthy();
  });

  test("we can get an attribute", () => {
    expect(Q("iron_chest").getAttribute("metal")).toBe(true);
    expect(Q("oak_chest").getAttribute("metal")).toBe(false);
  });

  test("we can get also use is()", () => {
    expect(Q("iron_chest").is("metal")).toBe(true);
    expect(Q("oak_chest").is("metal")).toBe(false);
  });

  test("we can declare and use 'wooden'", () => {
    QuixePlus.mergeAttrMap({
        wooden: "!metal"
    });
    expect(Q("iron_chest").is("wooden")).toBe(false);
    expect(Q("oak_chest").is("wooden")).toBe(true);
  });

  test("we can get the parent of an object (its container or room", () => {
    expect(Q("iron_chest").parent).toEqual(Q("test_room"));
    expect(Q("oak_chest").parent).toEqual(Q("nothing")); // TODO: maybe we should return null here
  });

  test("we can get what's in an object", () => {
    expect(Q("oak_chest").children).toContainEqual(Q("book"));
  });

  test("we can get numeric properties", () => {
    expect(Q("iron_chest").getProperty("weight")).toEqual(40);
    expect(Q("oak_chest").getProperty("weight")).toEqual(0);
  });

  test("we can get constant string properties", () => {
    expect(Q("iron_chest").getProperty("size", String)).toEqual("small");
  });

  test("we get null when getting an absent property", () => {
    expect(Q("iron_chest").getProperty("foo")).toBeNull();
    expect(Q("oak_chest").getProperty("size")).toBeNull();
  });

});
