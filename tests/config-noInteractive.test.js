import { afterEach, describe, expect, test } from "@jest/globals";
import prettyAnsi from "pretty-ansi";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("config-noInteractive", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_NO_INTERACTIVE' environment variable", () => {
  test("has default value", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    expect(JSON.parse(stdout)).toHaveProperty("noInteractive");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when truthy, interactive elements are disabled", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["TSTYCHE_NO_INTERACTIVE"]: "true",
      },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when falsy, interactive elements are enabled", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["TSTYCHE_NO_INTERACTIVE"]: "",
      },
    });

    expect(prettyAnsi(normalizeOutput(stdout))).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
