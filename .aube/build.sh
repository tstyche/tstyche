#!/bin/bash

set -e

cleanup() {
  rm -f ./source/index.cts
  rm -f ./types/index.cts
}

trap cleanup EXIT

rm -rf ./dist

sourceMap="false"
if [[ "$*" == *"--sourcemap"* ]]; then
  sourceMap="true"
fi

cp ./source/index.ts ./source/index.cts
cp ./types/index.ts ./types/index.cts

tsc --project ./source/tsconfig.json --checkJs false --noEmit false --removeComments true --sourceMap $sourceMap
tsc --project ./source/tsconfig.json --checkJs false --noEmit false --declaration --emitDeclarationOnly --declarationMap $sourceMap
tsc --project ./types/tsconfig.json --checkJs false --noEmit false --declaration --emitDeclarationOnly --declarationMap $sourceMap

rm -f ./dist/bin.d.ts
chmod +x ./dist/bin.js
