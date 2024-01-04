#! /bin/bash

hyperfine \
  --export-json 'examples.bench.json' \
  --prepare 'tstyche --prune && npm cache clean --force' \
  --time-unit 'second' \
  --warmup 1 \
  'tstyche examples' \
  'tstyche examples --target 5.2' \
  'tstyche examples --target 4.9'
