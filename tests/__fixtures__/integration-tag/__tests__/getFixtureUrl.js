import path from "node:path";

/**
 * @param {ImportMeta} tesFileMeta
 */
export function getFixtureUrl(tesFileMeta) {
  return path.dirname(tesFileMeta.dirname);
}
