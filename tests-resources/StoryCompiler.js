/* eslint-env node */
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process")
const uuid = require("uuid");
const rimraf = require("rimraf");
const StoryLoader = require("./StoryLoader")

function compile(source) {
    // 1 - make a temporary directory
    // 2 - generate story files
    // 4 - invoke inform
    // 5 - extract results
    // 6 - delete the temporary directory

    const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}story-`);
    const storyDir = path.resolve(tmpDir, "Story.inform");
    const materialsDir = path.resolve(tmpDir, "Story.materials");
    const buildDir = path.resolve(storyDir, "Build");
    const sourceDir = path.resolve(storyDir, "Source");
    const sourceFile = path.resolve(sourceDir, "story.ni");
    const uuidFile = path.resolve(storyDir, "uuid.txt");
    const settingsFile = path.resolve(storyDir, "Settings.plist");

    fs.mkdirSync(materialsDir);
    fs.mkdirSync(storyDir);
    fs.mkdirSync(buildDir);
    fs.mkdirSync(sourceDir);

    fs.writeFileSync(uuidFile, uuid.v4());
    fs.writeFileSync(sourceFile, source);
    fs.writeFileSync(settingsFile, `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
<key>IFCompilerOptions</key>
<dict>
    <key>IFSettingNaturalInform</key>
    <true/>
</dict>
<key>IFCompilerVersionSettings</key>
<dict/>
<key>IFI7OutputSettings</key>
<dict/>
<key>IFLibrarySettings</key>
<dict>
    <key>IFSettingLibraryToUse</key>
    <string>Natural</string>
</dict>
<key>IFMiscSettings</key>
<dict>
    <key>IFSettingInfix</key>
    <false/>
</dict>
<key>IFOutputSettings</key>
<dict>
    <key>IFSettingCompilerVersion</key>
    <string>6L38</string>
</dict>
</dict>
</plist>
    `);

  const releaseScript = path.resolve(__dirname, "../scripts/i7-release.js");
  execSync(`${releaseScript} ${storyDir}`, { stdio: ["inherit"] });

    const story = StoryLoader.load(storyDir);

    rimraf.sync(storyDir);

    return story
}

module.exports = {
    compile
};
