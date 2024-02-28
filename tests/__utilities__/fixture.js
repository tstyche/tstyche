import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {URL} fixtureFileUrl
 */
export async function clearFixture(fixtureFileUrl) {
  return fs.rm(fixtureFileUrl, { force: true, recursive: true });
}

/**
 * @param {string} fixture
 * @param {{ generated?: boolean }} [options]
 */
export function getFixtureFileUrl(fixture, options = { generated: false }) {
  return new URL(`../__fixtures__/${options.generated === true ? ".generated/" : ""}${fixture}/`, import.meta.url);
}

/**
 * @param {string} testFileUrl
 */
export function getTestFileName(testFileUrl) {
  const testFilePath = fileURLToPath(testFileUrl);

  return path.basename(testFilePath, ".test.js");
}

/**
 * @param {URL} fixtureFileUrl
 * @param {Record<string, string>} [files]
 */
export async function writeFixture(fixtureFileUrl, files) {
  await fs.mkdir(fixtureFileUrl, { recursive: true });

  if (files == null) {
    return;
  }

  for (const file in files) {
    const content = files[file];
    const directory = path.dirname(file);

    if (directory !== ".") {
      await fs.mkdir(new URL(directory, fixtureFileUrl), { recursive: true });
    }

    if (content != null) {
      await fs.writeFile(new URL(file, fixtureFileUrl), content);
    }
  }
}
