/* eslint-env node, jest */
const path = require("path");
const fs = require("fs");
const StoryCompiler = require("./StoryCompiler.js");

// include jQuery, Glkote, Quixe
const QuixePlusTemplate = path.resolve(__dirname, "../templates/QuixePlus");
window.$ = window.jQuery = require(path.resolve(
  QuixePlusTemplate,
  "jquery-1.12.4.min.js"
));
Object.assign(
  window,
  require(path.resolve(QuixePlusTemplate, "glkote.min.js"))
);
Object.assign(window, require(path.resolve(QuixePlusTemplate, "quixe.min.js")));
// include glkote CSS
const cssFile = path.join(QuixePlusTemplate, "glkote.css");
const css = fs.readFileSync(cssFile, "utf8");
window.$("<style>").html(css).appendTo(window.$("head"));
// create required HTML for Glkote
window
  .$("body")
  .html(
    '<div id="gameport"><div id="windowport"><div id="errorcontent"></div>'
  );

const { gameinfo } = require("../src/GameInfo.js");

let withStoryAlreadyCalled = false;
global.withStory = function withStory(storySource, callback) {
  if (withStoryAlreadyCalled) {
    throw new Error("You can only use one story per test file.");
  }
  withStoryAlreadyCalled = true;

  const story = StoryCompiler.compile(storySource);
  story.run(window, gameinfo);

  const firstLine = storySource.slice(0, storySource.indexOf("\n"));
  describe(`With story "${firstLine}"`, callback);
};


global.submitInput = function submitInput(...str) {
  const lines = str.flatMap(s => s.split("\n"))
  for (let line of lines) {
    const event = window.$.Event("keypress");
    event.which = event.keyCode = 13;
    window.$(".Input").val(line).trigger(event);
  }
}
