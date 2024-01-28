import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("validation-commandLine", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
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
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when no test files are present", async () => {
    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: "{}",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when search string does not select test files", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["sample"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});
