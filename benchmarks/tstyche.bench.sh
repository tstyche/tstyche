#!/bin/bash

hyperfine \
  --export-json 'tstyche.bench.json' \
  --time-unit 'second' \
  --warmup 2 \
  'yarn test:examples' \
  --command-name 'warm cache: tstyche examples' \
  --prepare '' \
  'yarn test:examples --target next' \
  --command-name 'warm cache: tstyche examples --target next' \
  --prepare '' \
  'yarn test:examples --target 5.2' \
  --command-name 'warm cache: tstyche examples --target 5.2' \
  --prepare '' \
  'yarn test:examples' \
  --command-name 'cold cache: tstyche examples' \
  --prepare 'tstyche --prune' \
  'yarn test:examples --target next' \
  --command-name 'cold cache: tstyche examples --target next' \
  --prepare 'tstyche --prune' \
  'yarn test:examples --target 5.2' \
  --command-name 'cold cache: tstyche examples --target 5.2' \
  --prepare 'tstyche --prune'
