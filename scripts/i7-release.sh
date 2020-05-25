#!/bin/sh

# fail early
set -e

# Directory of the current script, used to call i7-post-release
# It relies on GNU readlink (brew install coreutils)
SCRIPT_FILE=$(greadlink -f "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_FILE")

APP_CONTENTS="/Applications/Inform.app/Contents"
NI_BIN="$APP_CONTENTS/MacOS/6L38/ni"
I6_BIN="$APP_CONTENTS/MacOS/inform6"
CBLORB_BIN="$APP_CONTENTS/MacOS/cBlorb"

INTERNAL="$APP_CONTENTS/Resources/retrospective/6L38"
EXTERNAL="$HOME/Library/Inform"
LIBRARY="$APP_CONTENTS/Resources/Library/6.11"

PROJECT_DIR=$(realpath -e "$1")
PROJECT_NAME=$(basename "$PROJECT_DIR" .inform)
BUILD_DIR="$PROJECT_DIR/Build"
MATERIALS_DIR=$(realpath -e "$PROJECT_DIR/../$PROJECT_NAME.materials")

if [ ! -e "$PROJECT_DIR" ]; then
    echo "Could not find project."
    exit 1
fi

if [ "$TESTING" == "1" ]; then
    I6_OPTIONS="-kE2SDwG"
else
    NI_OPTIONS="-release"
    I6_OPTIONS="-kE2~S~DwG"
fi

# Move to build directory so that gameinfo.dbg is created there (as if called by Inform IDE)
cd "$BUILD_DIR"

# Release
$NI_BIN -internal "$INTERNAL" -external "$EXTERNAL" -project "$PROJECT_DIR" -format=ulx -noprogress $NI_OPTIONS

$I6_BIN "$I6_OPTIONS" "+include_path=$LIBRARY,.,../Source" "$PROJECT_DIR/Build/auto.inf" "$PROJECT_DIR/Build/output.ulx"

# In testing mode on OSX, the blurb file doesn't contain release instructions
if [ "$TESTING" == "1" ]; then
    # we insert this missing line
    INSERT="release to \"$MATERIALS_DIR/Release\""
    # after this existing line
    MATCH="project folder"
    # GNU sed ((brew install coreutils)
    gsed -i "/${MATCH}/ a $INSERT" "$PROJECT_DIR/Release.blurb"
fi

$CBLORB_BIN "$PROJECT_DIR/Release.blurb" "$PROJECT_DIR/Build/output.gblorb"

# Post release
# To speed up the XML parsing, we can lighten the debug file beforehand
if which xmlstarlet > /dev/null 2>&1 ; then
    xmlstarlet ed --inplace                         \
        -d "/inform-story-file/source"              \
        -d "/inform-story-file/story-file-prefix"   \
        -d "/inform-story-file/routine"             \
        -d "/inform-story-file/constant"            \
        -d "/inform-story-file/table-entry"         \
        -d "/inform-story-file/class"               \
        -d "/inform-story-file/fake-action"         \
        -d "/inform-story-file/action"              \
        -d "/inform-story-file/story-file-section"  \
        -d "//source-code-location"                 \
        "$PROJECT_DIR/Build/gameinfo.dbg"
fi

"$SCRIPT_DIR/i7-post-release.js" "$PROJECT_DIR"
