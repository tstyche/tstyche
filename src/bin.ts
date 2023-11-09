#!/usr/bin/env node
import { Cli } from "./tstyche.js";

const cli = new Cli(process);

await cli.run(process.argv.slice(2));
