#!/bin/bash

mkdir -p benchmark

hyperfine \
  --export-json 'benchmark/results.json' \
  --time-unit 'second' \
  --warmup 2 \
  'aube run test:examples' \
  --command-name 'warm cache: tstyche examples' \
  --prepare 'aube exec tstyche --update' \
  'aube run test:examples --target next' \
  --command-name 'warm cache: tstyche examples --target next' \
  --prepare 'aube exec tstyche --update' \
  'aube run test:examples --target 5.6' \
  --command-name 'warm cache: tstyche examples --target 5.6' \
  --prepare 'aube exec tstyche --update' \
  'aube run test:examples' \
  --command-name 'cold cache: tstyche examples' \
  --prepare 'aube exec tstyche --prune && aube exec tstyche --update' \
  'aube run test:examples --target next' \
  --command-name 'cold cache: tstyche examples --target next' \
  --prepare 'aube exec tstyche --prune && aube exec tstyche --update' \
  'aube run test:examples --target 5.6' \
  --command-name 'cold cache: tstyche examples --target 5.6' \
  --prepare 'aube exec tstyche --prune && aube exec tstyche --update'
