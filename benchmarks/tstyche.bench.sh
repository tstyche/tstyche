#!/bin/bash

hyperfine \
  --export-json 'tstyche.bench.json' \
  --time-unit 'second' \
  --warmup 2 \
  'yarn test:examples' \
  --command-name 'warm cache: tstyche examples' \
  --prepare 'tstyche --update' \
  'yarn test:examples --target next' \
  --command-name 'warm cache: tstyche examples --target next' \
  --prepare 'tstyche --update' \
  'yarn test:examples --target 5.2' \
  --command-name 'warm cache: tstyche examples --target 5.2' \
  --prepare 'tstyche --update' \
  'yarn test:examples' \
  --command-name 'cold cache: tstyche examples' \
  --prepare 'tstyche --prune && tstyche --update' \
  'yarn test:examples --target next' \
  --command-name 'cold cache: tstyche examples --target next' \
  --prepare 'tstyche --prune && tstyche --update' \
  'yarn test:examples --target 5.2' \
  --command-name 'cold cache: tstyche examples --target 5.2' \
  --prepare 'tstyche --prune && tstyche --update'
