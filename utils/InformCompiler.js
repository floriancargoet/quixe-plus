#!/usr/bin/env node
import path, { dirname } from "node:path";
import os from "node:os";
import fs from "node:fs";
import cp from "node:child_process";
import { fileURLToPath } from "node:url";

const APP_CONTENTS = "/Applications/Inform.app/Contents";
const NI_BIN = `${APP_CONTENTS}/MacOS/6L38/ni`;
const I6_BIN = `${APP_CONTENTS}/MacOS/inform6`;
const CBLORB_BIN = `${APP_CONTENTS}/MacOS/cBlorb`;

const INTERNAL = `${APP_CONTENTS}/Resources/retrospective/6L38`;
const EXTERNAL = `${os.homedir()}/Library/Inform`;
const LIBRARY = `${APP_CONTENTS}/Resources/Library/6.11`;

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultOptions = {
  testing: false,
  silent: false,
};

export class InformCompiler {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
    if (!fs.existsSync(options.story)) {
      console.error("Could not find project.");
      process.exit(1);
    }

    this.storyDir = options.story;
    const projectName = path.basename(this.storyDir, ".inform");
    this.buildDir = `${this.storyDir}/Build`;
    this.materialsDir = fs.realpathSync(
      path.resolve(this.storyDir, "..", projectName + ".materials")
    );
  }

  exec(command, args) {
    // remove empty args, always execute in BUILD_DIR
    cp.spawnSync(command, args.filter(Boolean), {
      stdio: ["inherit", this.options.silent ? "ignore" : "inherit", "inherit"],
      cwd: this.buildDir,
    });
  }

  compileI7() {
    // Compile I7 to I6
    this.exec(NI_BIN, [
      "-internal",
      INTERNAL,
      "-external",
      EXTERNAL,
      "-project",
      this.storyDir,
      "-format=ulx",
      "-noprogress",
      this.options.testing ? "" : "-release",
    ]);
  }

  compileI6() {
    // Compile I6 to ULX
    this.exec(I6_BIN, [
      // Flags (we use the same flags as the IDE on OSX)
      // k = output Infix debugging information to "gameinfo.dbg" (and switch -D on)
      // E2 = Macintosh MPW-style error messages
      // S = compile strict error-checking at run-time
      // D = insert "Constant DEBUG;" automatically
      // w = disable warning messages
      // G = compile a Glulx game file
      this.options.testing ? "-kE2SDwG" : "-kE2~S~DwG", // disable S & D but keep k in non-testing mode
      `+include_path=${LIBRARY},.,../Source`,
      `${this.buildDir}/auto.inf`,
      `${this.buildDir}/output.ulx`,
    ]);
  }

  release() {
    // In testing mode on OSX, the blurb file doesn't contain release instructions
    // Let's add them
    if (this.options.testing) {
      // we insert this missing line
      const insert = `release to "${this.materialsDir}/Release"\n`;
      // after this existing line
      const match = "project folder";
      // in this file
      const blurbFile = `${this.storyDir}/Release.blurb`;

      let contents = fs.readFileSync(blurbFile, "utf8");
      const index = contents.indexOf(match);
      contents = [contents.slice(0, index), insert, contents.slice(index)].join(
        ""
      );
      fs.writeFileSync(blurbFile, contents);
    }

    // Release the story
    this.exec(CBLORB_BIN, [
      `${this.storyDir}/Release.blurb`,
      `${this.buildDir}/output.gblorb`,
    ]);
  }

  postRelease() {
    // Post release
    // To speed up the XML parsing, we can lighten the debug file beforehand
    try {
      cp.spawnSync("xmlstarlet", [
        "ed",
        "--inplace",
        "-d",
        "/inform-story-file/source",
        "-d",
        "/inform-story-file/story-file-prefix",
        "-d",
        "/inform-story-file/routine",
        "-d",
        "/inform-story-file/constant",
        "-d",
        "/inform-story-file/table-entry",
        "-d",
        "/inform-story-file/fake-action",
        "-d",
        "/inform-story-file/action",
        "-d",
        "/inform-story-file/story-file-section",
        "-d",
        "//source-code-location",
        `${this.buildDir}/gameinfo.dbg`,
      ]);
    } catch (e) {
      // user doesn't have xmlstartlet
    }

    // FIXME: import code directly
    cp.spawnSync(
      path.resolve(__dirname, "../scripts/i7-post-release.js"),
      [this.storyDir],
      {
        stdio: "inherit",
      }
    );
  }
}
