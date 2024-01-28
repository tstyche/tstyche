import fs from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const packageConfigText = await fs.readFile(new URL("../package.json", import.meta.url), { encoding: "utf8" });
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version } = /** @type {{ version: string }} */ (JSON.parse(packageConfigText));

const fixtureUrl = getFixtureUrl("config-help", { generated: true });

beforeAll(async () => {
  await writeFixture(fixtureUrl);
});

afterAll(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--help' command line option", () => {
  test.each([
    {
      args: ["--help"],
      testCase: "prints the list of command line options",
    },
    {
      args: ["--help", "false"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--help"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--help", "feature"],
      testCase: "ignores search string specified after the option",
    },
  ])("$testCase", async ({ args }) => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    expect(stdout.replace(version, "<<version>>")).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
