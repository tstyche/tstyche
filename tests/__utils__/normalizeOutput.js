/**
 * @param {string} output
 */
export function normalizeOutput(output) {
  return output
    .replaceAll(process.cwd().replaceAll("\\", "/"), "<<cwd>>")
    .replaceAll(/(Duration:\s{2})\s((?:\d\.?)+s)/g, "$1 <<timestamp>>")
    .replaceAll(/(uses TypeScript)\s(\d\.?)+/g, "$1 <<version>>");
}
