#!/usr/bin/env node
import process from "node:process";
import { Cli } from "./api.js";

const cli = new Cli();
const commandLine = process.argv.slice(2);

process.exitCode = await cli.run(commandLine);
