/* eslint-env node */
const fs = require("fs");
const path = require("path");
const StoryLoader = require("./story-loader.js");

// include jQuery, Glkite, Quixe
const QuixePlusTemplate = "templates/QuixePlus";
window.$ = window.jQuery = require(path.resolve(
  QuixePlusTemplate,
  "jquery-1.12.4.min.js"
));
Object.assign(
  window,
  require(path.resolve(QuixePlusTemplate, "glkote.min.js"))
);
Object.assign(window, require(path.resolve(QuixePlusTemplate, "quixe.min.js")));

const gameinfo = require("../src/GameInfo.js").gameinfo;

function setupPage() {
  // include glkote CSS
  const cssFile = path.join(QuixePlusTemplate, "glkote.css");
  const css = fs.readFileSync(cssFile, "utf8");
  window.$("<style>").html(css).appendTo(window.$("head"));
  window
    .$("body")
    .html(
      '<div id="gameport"><div id="windowport"><div id="errorcontent"></div>'
    );
}

function setupStory(storyName) {
  const story = StoryLoader.load(storyName);

  gameinfo.init(story.gameinfo);
  window.game_options = {
    // called after each update even if recording is disabled
    // before_select_hook : updater.before_select_hook,
    //image_info_map: 'StaticImageInfo',  // image data is here, not in blorb
    use_query_story: false,
    log_execution_time: false,
    set_page_title: false,
    inspacing: 0, // gap between windows
    outspacing: 0, // gap between windows and edge of gameport
  };
  window.GiLoad.load_run(null, story.ulx, "base64");
}

let withStoryAlreadyCalled = false;
global.withStory = function withStory(storyName, callback) {
  if (withStoryAlreadyCalled) {
    throw new Error("You can only use one story per test file.");
  }
  withStoryAlreadyCalled = true;
  setupStory(storyName);
  describe(`With story "${storyName}"`, callback);
};

setupPage();
