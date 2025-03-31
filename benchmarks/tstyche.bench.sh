#!/bin/bash

hyperfine \
  --export-json 'tstyche.bench.json' \
  --time-unit 'second' \
  --warmup 2 \
  'tstyche examples' \
  --command-name 'warm cache: tstyche examples' \
  --prepare '' \
  'tstyche examples --target next' \
  --command-name 'warm cache: tstyche examples --target next' \
  --prepare '' \
  'tstyche examples --target 5.2' \
  --command-name 'warm cache: tstyche examples --target 5.2' \
  --prepare '' \
  'tstyche examples' \
  --command-name 'cold cache: tstyche examples' \
  --prepare 'tstyche --prune' \
  'tstyche examples --target next' \
  --command-name 'cold cache: tstyche examples --target next' \
  --prepare 'tstyche --prune' \
  'tstyche examples --target 5.2' \
  --command-name 'cold cache: tstyche examples --target 5.2' \
  --prepare 'tstyche --prune'
