#!/usr/bin/env node

import fs from "node:fs";
import { InformCompiler } from "../utils/InformCompiler.js";

if (!process.argv[2]) {
  console.error("Usage:");
  console.error(`node i7-release.js path/to/story.inform`);
  process.exit(1);
}

const story = fs.realpathSync(process.argv[2]);
const compiler = new InformCompiler({
  story,
  testing: process.env.TESTING === "1",
});

compiler.compileI7();
compiler.compileI6();
compiler.release();
compiler.postRelease();
