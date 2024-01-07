import fs from "node:fs/promises";
import path from "node:path";
import { getFixtureUrl } from "./getFixtureUrl.js";

/**
 * @param {string} fixture
 */
export async function clearFixture(fixture) {
  return fs.rm(getFixtureUrl(fixture), { force: true, recursive: true });
}

/**
 * @param {string} fixture
 * @param {Record<string, string>} files
 */
export async function writeFixture(fixture, files) {
  const fixtureUrl = getFixtureUrl(fixture);

  await fs.mkdir(fixtureUrl, { recursive: true });

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
