#!/usr/bin/env node
/* eslint-env node */
const fs = require("fs");
const path = require("path");
const convertGameinfo = require("../utils/convertGameinfo");

console.log("Inform Post Release Script");

const PROJECT_DIR = fs.realpathSync(process.argv[2]);
const PROJECT_NAME = path.basename(PROJECT_DIR, ".inform");
const MATERIALS_DIR = path.resolve(
  PROJECT_DIR,
  "..",
  `${PROJECT_NAME}.materials`
);
const GAMEINFO_FILE = path.resolve(PROJECT_DIR, "Build/gameinfo.dbg");
const RELEASE_DIR = path.resolve(MATERIALS_DIR, "Release");
const RELEASE_FILES = [
  path.resolve(MATERIALS_DIR, "map.svg"),
  path.resolve(MATERIALS_DIR, "map.js"),
];

// Release these files if they exist
RELEASE_FILES.forEach((file) => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.resolve(RELEASE_DIR, path.basename(file)));
    console.log("Released extra file", path.basename(file));
  }
});

// Fail if the debug file is not found
if (!fs.existsSync(GAMEINFO_FILE)) {
  console.error(
    `Debug file not found: ${GAMEINFO_FILE}\nCheck if your game is compiled with debug informations.`
  );
  process.exit(1);
}

const gameinfo = convertGameinfo(fs.readFileSync(GAMEINFO_FILE, "utf8"));

const gameinfoContents = `var gameinfo = ${JSON.stringify(gameinfo)};`;
fs.writeFileSync(path.resolve(RELEASE_DIR, "gameinfo.js"), gameinfoContents);
console.log("Post Release Script has finished");
