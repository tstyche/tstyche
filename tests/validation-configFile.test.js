import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("validation-configFile", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'tstyche.config.json' file", () => {
  test("handles unknown options", async () => {
    const config = {
      cache: "all",
      silent: true,
      testFileMatch: ["**/packages/*/__typetests__/*.test.ts"],
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles option argument of wrong type", async () => {
    const config = {
      failFast: "always",
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when tabs are used for indentation, handles option argument of wrong type", async () => {
    const configText = `{
\t"failFast": false,
\t"rootPath": true
}
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles wrong root value", async () => {
    const config = [{ failFast: true }];

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles syntax error", async () => {
    const configText = `{
  'failFast': true
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles single quoted property names", async () => {
    const configText = `{
  'failFast': true
}`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles single quoted values", async () => {
    const configText = `{
  "rootPath": '../'
}`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles single quoted list items", async () => {
    const configText = `{
  "target": ['4.8']
}`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});

describe("'--config' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--config"]);

    expect(stdout).toBe("");
    expect(stderr).toBe(
      [
        "Error: Option '--config' expects an argument.",
        "",
        "Option '--config' requires an argument of type string.",
        "",
        "",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});
