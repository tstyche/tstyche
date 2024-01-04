#! /bin/bash

hyperfine --prepare 'tstyche --prune' --time-unit 'second' 'tstyche examples' 'tstyche examples --target 4.9' 'tstyche examples --target 5.2'
