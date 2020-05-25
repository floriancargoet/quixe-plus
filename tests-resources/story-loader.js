/* eslint-env node */
const fs = require("fs");
const path = require("path");
const convertGameInfo = require("../utils/convertGameInfo");

// Cache shared between test files
// Jest runs each test file with its own module registry so we can't rely on Node module cache.
// We could use a custom environment but Jest spawns multiple workers.

module.exports = {
  load(storyName) {
    let story;
    // Load the ULX file as base64
    // Load & convert the gameinfo file
    const buildDir = path.resolve(
      __dirname,
      "stories",
      storyName + ".inform",
      "Build"
    );
    const ulxFile = path.resolve(buildDir, "output.ulx");
    const gameinfoFile = path.resolve(buildDir, "gameinfo.dbg");
    if (fs.existsSync(ulxFile) && fs.existsSync(gameinfoFile)) {
      convertGameInfo(fs.readFileSync(gameinfoFile, "utf8"), function (
        error,
        converted
      ) {
        if (error) {
          console.error(error);
          process.exit(1);
        }

        const b64 = fs.readFileSync(ulxFile).toString("base64");
        story = {
          ulx: b64,
          gameinfo: converted,
        };
      });
    } else {
      throw new Error(storyName + " not found");
    }
    return story;
  },
};
