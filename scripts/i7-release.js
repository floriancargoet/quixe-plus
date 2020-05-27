#!/usr/bin/env node
/* eslint-env node */
const path = require("path");
const os = require("os");
const fs = require("fs");
const cp = require("child_process");

const APP_CONTENTS = "/Applications/Inform.app/Contents";
const NI_BIN = `${APP_CONTENTS}/MacOS/6L38/ni`;
const I6_BIN = `${APP_CONTENTS}/MacOS/inform6`;
const CBLORB_BIN = `${APP_CONTENTS}/MacOS/cBlorb`;

const INTERNAL = `${APP_CONTENTS}/Resources/retrospective/6L38`;
const EXTERNAL = `${os.homedir()}/Library/Inform`;
const LIBRARY = `${APP_CONTENTS}/Resources/Library/6.11`;

if (!process.argv[2]) {
  console.error("Usage:");
  console.error(`node i7-release.js path/to/story.inform`)
  process.exit(1);
}

const PROJECT_DIR = fs.realpathSync(process.argv[2]);
const PROJECT_NAME = path.basename(PROJECT_DIR, ".inform");
const BUILD_DIR = `${PROJECT_DIR}/Build`;
const MATERIALS_DIR = fs.realpathSync(
  path.resolve(PROJECT_DIR, "..", PROJECT_NAME + ".materials")
);

if (!fs.existsSync(PROJECT_DIR)) {
  console.error("Could not find project.");
  process.exit(1);
}

function exec(command, args) {
    // remove empty args, always execute in BUILD_DIR
    cp.spawnSync(command, args.filter(Boolean), { stdio: "inherit", cwd: BUILD_DIR });
}

// Compile I7 to I6
exec(NI_BIN, [
  "-internal",
  INTERNAL,
  "-external",
  EXTERNAL,
  "-project",
  PROJECT_DIR,
  "-format=ulx",
  "-noprogress",
  process.env.TESTING === "1" ? "": "-release"
]);

// Compile I6 to ULX
exec(
  I6_BIN,
  [
    // Flags (we use the same flags as the IDE on OSX)
    // k = output Infix debugging information to "gameinfo.dbg" (and switch -D on)
    // E2 = Macintosh MPW-style error messages
    // S = compile strict error-checking at run-time
    // D = insert "Constant DEBUG;" automatically
    // w = disable warning messages
    // G = compile a Glulx game file
    process.env.TESTING === "1" ? "-kE2SDwG" : "-kE2~S~DwG", // disable S & D but keep k in non-testing mode
    `+include_path=${LIBRARY},.,../Source`,
    `${PROJECT_DIR}/Build/auto.inf`,
    `${PROJECT_DIR}/Build/output.ulx`,
  ]
);

// In testing mode on OSX, the blurb file doesn't contain release instructions
// Let's add them
if (process.env.TESTING === "1") {
  // we insert this missing line
  const INSERT = `release to "${MATERIALS_DIR}/Release"\n`;
  // after this existing line
  const MATCH = "project folder";

  const BLURB_FILE = `${PROJECT_DIR}/Release.blurb`;
  let contents = fs.readFileSync(BLURB_FILE, "utf8");
  const index = contents.indexOf(MATCH);
  contents = [contents.slice(0, index), INSERT, contents.slice(index)].join("");
  fs.writeFileSync(BLURB_FILE, contents);
}

// Release the story
exec(
  CBLORB_BIN,
  [`${PROJECT_DIR}/Release.blurb`, `${PROJECT_DIR}/Build/output.gblorb`]
);

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
    "/inform-story-file/class",
    "-d",
    "/inform-story-file/fake-action",
    "-d",
    "/inform-story-file/action",
    "-d",
    "/inform-story-file/story-file-section",
    "-d",
    "//source-code-location",
    `${PROJECT_DIR}/Build/gameinfo.dbg`,
  ]);
} catch (e) {
  // user doesn't have xmlstartlet
}

cp.spawnSync(path.resolve(__dirname, "i7-post-release.js"), [PROJECT_DIR], {
  stdio: "inherit",
});
