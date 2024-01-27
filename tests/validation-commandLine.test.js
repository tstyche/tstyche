import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "validation-commandLine";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'tstyche' command", () => {
  test.each([
    {
      args: ["--cache"],
      testCase: "handles unknown command line option in a long form",
    },
    {
      args: ["-c"],
      testCase: "handles unknown command line option in a short form",
    },
  ])("$testCase", async ({ args }) => {
    await writeFixture(fixture);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, args);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});
