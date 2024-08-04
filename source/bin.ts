#!/usr/bin/env node
import process from "node:process";
import { Cli } from "./tstyche.js";

const cli = new Cli();

await cli.run(process.argv.slice(2));

process.exit();
