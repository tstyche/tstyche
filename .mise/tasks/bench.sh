#!/bin/bash

hyperfine \
  --export-json 'tstyche.bench.json' \
  --time-unit 'second' \
  --warmup 2 \
  'yarn test:examples' \
  --command-name 'warm cache: tstyche examples' \
  --prepare 'yarn tstyche --update' \
  'yarn test:examples --target next' \
  --command-name 'warm cache: tstyche examples --target next' \
  --prepare 'yarn tstyche --update' \
  'yarn test:examples --target 5.6' \
  --command-name 'warm cache: tstyche examples --target 5.6' \
  --prepare 'yarn tstyche --update' \
  'yarn test:examples' \
  --command-name 'cold cache: tstyche examples' \
  --prepare 'yarn tstyche --prune && yarn tstyche --update' \
  'yarn test:examples --target next' \
  --command-name 'cold cache: tstyche examples --target next' \
  --prepare 'yarn tstyche --prune && yarn tstyche --update' \
  'yarn test:examples --target 5.6' \
  --command-name 'cold cache: tstyche examples --target 5.6' \
  --prepare 'yarn tstyche --prune && yarn tstyche --update'
