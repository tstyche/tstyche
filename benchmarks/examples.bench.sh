#! /bin/bash

targets=('tstyche examples' 'tstyche examples --target 4.9' 'tstyche examples --target 5.2')

hyperfine --export-json 'examples.bench.json' --prepare 'tstyche --prune' --time-unit 'second' --warmup 1 "${targets[@]}"
