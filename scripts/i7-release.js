#!/usr/bin/env node
/* eslint-env node */
const fs = require("fs");
const InformCompiler = require("../utils/InformCompiler.js");

if (!process.argv[2]) {
  console.error("Usage:");
  console.error(`node i7-release.js path/to/story.inform`);
  process.exit(1);
}

const story = fs.realpathSync(process.argv[2]);
const compiler = new InformCompiler({
    story,
    testing: process.env.TESTING === "1"
});

compiler.compileI7();
compiler.compileI6();
compiler.release();
compiler.postRelease();
