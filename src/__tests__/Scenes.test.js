/* eslint-env jest */
/* global withStory submitInput */
const { query: Q } = require("../query.js");
const { VM } = require("../VM.js");

const scenesStory = `"Scenes" by Florian.

The test room is a room.
The table is in the test room.
The mission statement, the gold coin and the silver coin are on the table.
The description of the mission statement is "Your mission is to take the gold coin."

Mission_1 is a scene. Mission_1 begins when we have examined the mission statement.
Mission_1 ends successfully when the player carries the gold coin.
Mission_1 ends badly when the player carries the silver coin.

When Mission_1 ends successfully, say "Well done!"
When Mission_1 ends badly, say "Oh no!"
`;

withStory(scenesStory, () => {

  beforeEach(() => {
    // restart the story
    submitInput("restart", "yes");
  });

  test("we can list existing scenes", () => {
    const rulebookNames = Q("RulebookNames")
      .toJSArray()
      .map(VM.getConstantString);

    const re = /^[Ww]hen (.+) begins rulebook$/;
    const scenes = rulebookNames
      .filter((n) => re.test(n))
      .map((n) => n.match(re)[1]);

    expect(scenes).toEqual(["play", "scene", "Entire Game", "Mission_1"]);
  });

  test("we can get the scenes status", () => {
    expect(Q("scene_status").toJSArray()).toEqual([1, 0, 0, 0]);
    // The 1st item represents the "play" scene,
    // The 2nd item represents the "Mission_1" scene
    // I don't know yet what the 2 last are // TODO: find out!
    // 0 means not beginned
    // 1 means beginned
    // 2 means ended
    submitInput("x mission statement");
    expect(Q("scene_status").toJSArray()).toEqual([1, 1, 0, 0]);

    submitInput("take gold coin");
    expect(Q("scene_status").toJSArray()).toEqual([1, 2, 0, 0]);

    submitInput("restart", "yes");
    submitInput("x mission statement");
    expect(Q("scene_status").toJSArray()).toEqual([1, 1, 0, 0]);

    submitInput("take silver coin");
    expect(Q("scene_status").toJSArray()).toEqual([1, 2, 0, 0]);
  });

  test("we can get the scene endings", () => {
    const rulebookNames = Q("RulebookNames")
      .toJSArray()
      .map(VM.getConstantString);
    const re = /^[Ww]hen (.+) ends ?(.*) rulebook$/;
    const endings = {};
    rulebookNames
      .filter((n) => re.test(n))
      .forEach((n) => {
        const [, scene, ending] = n.match(re);
        endings[scene] = endings[scene] || [];
        if (ending) {
          endings[scene].push(ending);
        }
      });

    expect(endings).toEqual({
      play: [],
      scene: [],
      "Entire Game": [],
      Mission_1: ["successfully", "badly"],
    });
  });

  test("we can get the status of scenes", () => {
    // Q("scene_endings") tells which ending occured (each value seems to be used as bits)
    // bit 1 - scene started
    // bit 2 - scene ended
    // bit 3 - scene ended with ending 1
    // bit 4 - scene ended with ending 2
    // bit N - scene ended with ending N - 2
    // we can also get the ending names by parsing the rulebook names
    expect(Q("scene_endings").at(1)).toEqual(0b000); // not started
    submitInput("x mission statement");
    expect(Q("scene_endings").at(1)).toEqual(0b001); // started
    submitInput("take silver coin");
    expect(Q("scene_endings").at(1)).toEqual(0b1011); // started, ended, ended with ending 2

  });
});
