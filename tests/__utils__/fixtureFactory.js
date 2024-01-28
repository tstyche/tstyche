import fs from "node:fs/promises";
import path from "node:path";

/**
 * @param {URL} fixtureUrl
 */
export async function clearFixture(fixtureUrl) {
  return fs.rm(fixtureUrl, { force: true, recursive: true });
}

/**
 * @param {string} fixture
 * @param {{ generated?: boolean }} [options]
 */
export function getFixtureUrl(fixture, options = { generated: false }) {
  return new URL(`../__fixtures__/${options.generated === true ? ".generated/" : ""}${fixture}/`, import.meta.url);
}

/**
 * @param {URL} fixtureUrl
 * @param {Record<string, string>} [files]
 */
export async function writeFixture(fixtureUrl, files) {
  await fs.mkdir(fixtureUrl, { recursive: true });

  if (files == null) {
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
