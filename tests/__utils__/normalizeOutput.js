const rootPath = process.cwd().replace(/\\/g, "/");

/**
 * @param {string} output
 */
export function normalizeOutput(output) {
  return output
    .replace(new RegExp(rootPath, "g"), "<<cwd>>")
    .replace(/(Duration:\s{2})\s((?:\d\.?)+s)/g, "$1 <<timestamp>>")
    .replace(/(uses TypeScript)\s(\d\.?)+/g, "$1 <<version>>");
}
