/* eslint-env node */
import fs from "node:fs";
import path from "node:path";
import { convertGameInfo } from "../utils/convertGameInfo";

// Cache shared between test files
// Jest runs each test file with its own module registry so we can't rely on Node module cache.
// We could use a custom environment but Jest spawns multiple workers.

class Story {
  constructor({ ulx, gameinfo }) {
    this.ulx = ulx;
    this.gameinfo = gameinfo;
  }

  run(globalObject, gameinfo) {
    gameinfo.init(this.gameinfo);

    globalObject.game_options = {
      // called after each update even if recording is disabled
      // before_select_hook : updater.before_select_hook,
      //image_info_map: 'StaticImageInfo',  // image data is here, not in blorb
      use_query_story: false,
      log_execution_time: false,
      set_page_title: false,
      inspacing: 0, // gap between windows
      outspacing: 0, // gap between windows and edge of gameport
    };
    globalObject.GiLoad.load_run(null, this.ulx, "base64");
  }
}

export const storyLoader = {
  load(storyPath) {
    // Load the ULX file as base64
    // Load & convert the gameinfo file
    const buildDir = path.resolve(storyPath, "Build");
    const ulxFile = path.resolve(buildDir, "output.ulx");
    const gameinfoFile = path.resolve(buildDir, "gameinfo.dbg");
    if (fs.existsSync(ulxFile) && fs.existsSync(gameinfoFile)) {
      const gameinfo = convertGameInfo(fs.readFileSync(gameinfoFile, "utf8"));
      const ulx = fs.readFileSync(ulxFile).toString("base64");
      return new Story({
        ulx,
        gameinfo,
      });
    } else {
      throw new Error("Story not found");
    }
  },
};
