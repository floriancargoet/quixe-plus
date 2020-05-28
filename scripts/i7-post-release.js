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
const MANIFEST_FILE = path.resolve(MATERIALS_DIR, "quixe-plus-manifest.json");
let manifest = {};
if (fs.existsSync(MANIFEST_FILE)) {
  manifest = require(MANIFEST_FILE);
}

// Release extra files
(manifest.release || []).forEach((file) => {
  file = path.resolve(MATERIALS_DIR, file);
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.resolve(RELEASE_DIR, path.basename(file)));
    console.log("Released extra file", path.basename(file));
  }
});

// Inject scripts
if (manifest.scripts && manifest.scripts.length > 0) {
  const placeholderTag = "<!-- extra scripts here -->";
  const tags = manifest.scripts.map((file) => `<script src="${file}" type="text/javascript"></script>`);
  const htmlFile = path.resolve(RELEASE_DIR, "play.html");
  let html = fs.readFileSync(htmlFile, "utf8");
  html = html.replace("<!-- extra scripts here -->", [placeholderTag, ...tags].join("\n"));
  fs.writeFileSync(htmlFile, html);
}

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
