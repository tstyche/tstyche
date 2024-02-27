import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string} testFileUrl
 */
export function getTestFileName(testFileUrl) {
  const testFilePath = fileURLToPath(testFileUrl);

  return path.basename(testFilePath, ".test.js");
}
