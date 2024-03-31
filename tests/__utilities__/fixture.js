import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {URL} fixtureUrl
 */
export async function clearFixture(fixtureUrl) {
  return fs.rm(fixtureUrl, { force: true, recursive: true });
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
 * @param {URL} fixtureUrl
 * @param {Array<string>} files
 */
export async function removeFixtureFiles(fixtureUrl, files) {
  for (const filePath of files) {
    await fs.rm(new URL(filePath, fixtureUrl), { force: true, recursive: true });
  }
}

/**
 * @param {URL} fixtureUrl
 * @param {Array<[string, string]>} files
 */
export async function renameFixtureFiles(fixtureUrl, files) {
  for (const [oldFilePath, newFilePath] of files) {
    await fs.rename(new URL(oldFilePath, fixtureUrl), new URL(newFilePath, fixtureUrl));
  }
}

// TODO rename to 'writeFixtureFiles'
/**
 * @param {URL} fixtureUrl
 * @param {Record<string, string>} [files]
 */
export async function writeFixture(fixtureUrl, files) {
  await fs.mkdir(fixtureUrl, { recursive: true });

  if (files == null) {
    return;
  }

  for (const filePath in files) {
    const content = files[filePath];
    const directoryPath = path.dirname(filePath);

    if (directoryPath !== ".") {
      await fs.mkdir(new URL(directoryPath, fixtureUrl), { recursive: true });
    }

    if (content != null) {
      await fs.writeFile(new URL(filePath, fixtureUrl), content);
    }
  }
}
