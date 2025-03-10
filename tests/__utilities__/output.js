import process from "node:process";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const basePath = process.cwd().replace(/\\/g, "/");
const baseUrl = pathToFileURL(process.cwd()).toString();

/**
 * @param {string} output
 */
export function normalizeOutput(output) {
  return output
    .replace(new RegExp(baseUrl, "g"), "<<baseUrl>>")
    .replace(new RegExp(basePath, "g"), "<<basePath>>")
    .replace(/(Duration:\s{2})\s((?:\d\.?)+s)/g, "$1 <<timestamp>>")
    .replace(new RegExp(`TypeScript ${ts.version}`, "g"), "TypeScript <<version>>");
}
