#!/bin/sh

for PROJECT in examples/*.inform; do
    NAME=$(basename $PROJECT ".inform")
    if [ "$NAME" != "" ]; then
        scripts/i7-release.js "$PROJECT"
        rm -rf "docs/${NAME}"
        cp -r "examples/${NAME}.materials/Release" "docs/$NAME"
    fi
done
