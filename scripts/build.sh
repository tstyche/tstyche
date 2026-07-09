#!/bin/bash

set -e

cleanup() {
  rm -f ./source/index.cts
  rm -f ./types/index.cts
}

trap cleanup EXIT

# prebuild

rm -rf ./dist
cp ./source/index.ts ./source/index.cts
cp ./types/index.ts ./types/index.cts

# build

sourceMap="false"
if [[ "$*" == *"--sourcemap"* ]]; then
  sourceMap="true"
fi

tsc --project ./source/tsconfig.json --checkJs false --noEmit false --removeComments true --sourceMap $sourceMap
tsc --project ./source/tsconfig.json --checkJs false --noEmit false --declaration --emitDeclarationOnly --declarationMap $sourceMap
tsc --project ./types/tsconfig.json --checkJs false --noEmit false --declaration --emitDeclarationOnly --declarationMap $sourceMap

# postbuild

version=$(jaq -r ".version" package.json)

rm -f ./dist/bin.d.ts
chmod +x ./dist/bin.js

rg -l "__version__" dist/ | xargs perl -i -pe "s/__version__/$version/g"
rg -l "const enum" dist/ | xargs perl -i -pe "s/const enum/enum/g"
