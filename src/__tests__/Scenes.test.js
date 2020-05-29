/* eslint-env jest */
/* global withStory submitInput */
const { query: Q } = require("../query.js");
const { VM } = require("../VM.js");

const scenesStory = `"Scenes" by Florian.

The test room is a room.
The table is in the test room.
The mission statement, the gold coin, the silver coin, the iron coin are on the table.
The description of the mission statement is "Your mission is to take the gold coin."

Mission_1 is a scene. Mission_1 begins when we have examined the mission statement.
Mission_1 ends successfully when the player carries the gold coin.
Mission_1 ends badly when the player carries the silver coin.
Mission_1 ends strangely when the player carries the iron coin.

When Mission_1 ends successfully, say "Well done!"
When Mission_1 ends badly, say "Oh no!"
When Mission_1 ends strangely, say "What?"
`;

const sceneEndingRulebookRegexp = /^[Ww]hen (.+) ends ?(.*) rulebook$/;
function getScenes() {
  const endings = {};
  // get all rulebook names as strings
  Q("RulebookNames")
    .toJSArray()
    .map(VM.getConstantString)
    // keep the scene ending ones
    .filter((n) => sceneEndingRulebookRegexp.test(n))
    // extract scene name & endings
    .forEach((n) => {
      const [, scene, ending] = n.match(sceneEndingRulebookRegexp);
      // ignore special values
      if (scene !== "scene" && scene !== "Entire Game") {
        endings[scene] = endings[scene] || [];
        if (ending) {
          endings[scene].push(ending);
        }
      }
    });
  const endingStatus = Q("scene_endings");
  const scenes = {};
  Object.keys(endings).forEach((scene, i) => {
    // bit 1 - scene started
    // bit 2 - scene ended
    // bit 3 - scene ended with ending 1
    // bit 4 - scene ended with ending 2
    // bit N - scene ended with ending N - 2
    const status = endingStatus.at(i);
    const started = (status & 1) === 1;
    const ended = (status & 2) === 2;
    const endingIndex = ended ? Math.log2(status >> 2) : -1;
    scenes[scene] = {
      started,
      ended,
      ending: endings[scene][endingIndex] || null,
    };
  });
  return scenes;
}

withStory(scenesStory, () => {
  beforeEach(() => {
    // restart the story
    submitInput("restart", "yes");
  });

  test("we can list existing scenes", () => {
    const scenes = Object.keys(getScenes());
    expect(scenes).toEqual(["play", "Mission_1"]);
  });

  test("we can get the started scenes", () => {
    let scenes = getScenes();
    expect(scenes["play"].started).toBe(true);
    expect(scenes["Mission_1"].started).toBe(false);
    submitInput("x mission statement");
    scenes = getScenes();
    expect(scenes["play"].started).toBe(true);
    expect(scenes["Mission_1"].started).toBe(true);
  });

  test("we can get the ended scenes", () => {
    let scenes = getScenes();
    expect(scenes["play"].ended).toBe(false);
    expect(scenes["Mission_1"].ended).toBe(false);
    submitInput("x mission statement");
    scenes = getScenes();
    expect(scenes["play"].ended).toBe(false);
    expect(scenes["Mission_1"].ended).toBe(false);
    submitInput("take gold coin");
    scenes = getScenes();
    expect(scenes["play"].ended).toBe(false);
    expect(scenes["Mission_1"].ended).toBe(true);
  });

  test("we can get the specific ending", () => {
    expect(getScenes()["Mission_1"].ending).toEqual(null);
    submitInput("x mission statement");
    expect(getScenes()["Mission_1"].ending).toEqual(null);
    submitInput("take gold coin");
    expect(getScenes()["Mission_1"].ending).toEqual("successfully");
    submitInput(`
      restart
      yes
      x mission statement
      take silver coin
    `);
    expect(getScenes()["Mission_1"].ending).toEqual("badly");
    submitInput(`
      restart
      yes
      x mission statement
      take iron coin
    `);
    expect(getScenes()["Mission_1"].ending).toEqual("strangely");
  });
});
