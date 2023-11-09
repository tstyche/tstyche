import fs from "node:fs/promises";
import path from "node:path";
import { getFixtureUrl } from "./getFixtureUrl.js";

export async function clearFixture(fixture: string): Promise<void> {
  return fs.rm(getFixtureUrl(fixture), { force: true, recursive: true });
}

export async function writeFixture(fixture: string, files: Record<string, string>): Promise<void> {
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
