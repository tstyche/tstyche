import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const generatedFixtureUrl = new URL("../__fixtures__/.generated/", import.meta.url);

/**
 * @param {URL} fixtureUrl
 */
export async function clearFixture(fixtureUrl) {
  await fs.rm(fixtureUrl, { force: true, recursive: true, maxRetries: 4 });
}

export async function cleanFixtureDirectory() {
  await clearFixture(generatedFixtureUrl);
}

/**
 * @param {URL} fixtureUrl
 * @param {string} source
 * @param {string} target
 */
export async function createSymbolicLink(fixtureUrl, source, target) {
  await fs.symlink(new URL(source, fixtureUrl), new URL(target, fixtureUrl));
}

/**
 * @param {string} fixture
 * @param {{ generated?: boolean }} [options]
 */
export function getFixtureFileUrl(fixture, options = { generated: false }) {
  return new URL(`../__fixtures__/${options.generated ? ".generated/" : ""}${fixture}/`, import.meta.url);
}

/**
 * @param {string} testFileUrl
 */
export function getTestFileName(testFileUrl) {
  const testFilePath = fileURLToPath(testFileUrl);

  return path.basename(testFilePath, ".test.js");
}

/**
 * @param {URL} fixtureUrl
 * @param {Record<string, string | undefined>} [files]
 */
export async function writeFixture(fixtureUrl, files) {
  await fs.mkdir(fixtureUrl, { recursive: true });

  if (!files) {
    return;
  }

  for (const file in files) {
    const content = files[file];
    const directory = path.dirname(file);

    if (directory !== ".") {
      await fs.mkdir(new URL(directory, fixtureUrl), { recursive: true });
    }

    if (content != null) {
      await fs.writeFile(new URL(file, fixtureUrl), content);
    }
  }
}
