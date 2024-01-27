import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "config-file";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'tstyche.config.json' file", () => {
  test("handles unknown options", async () => {
    const config = {
      cache: "all",
      silent: true,
      testFileMatch: ["**/packages/*/__typetests__/*.test.ts"],
    };

    await writeFixture(fixture, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles option argument of wrong type", async () => {
    const config = {
      failFast: "always",
    };

    await writeFixture(fixture, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles list item of wrong type", async () => {
    const config = {
      testFileMatch: [true],
    };

    await writeFixture(fixture, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles wrong root value", async () => {
    const config = [{ setupTimeout: 30 }];

    await writeFixture(fixture, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles single quoted property names", async () => {
    const configText = `{
  'failFast': true
}`;

    await writeFixture(fixture, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles single quoted values", async () => {
    const configText = `{
  "rootPath": '../'
}`;

    await writeFixture(fixture, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles single quoted list items", async () => {
    const configText = `{
  "target": ['4.8']
}`;

    await writeFixture(fixture, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("handles comments", async () => {
    const configText = `{
  /* test */
  "failFast": true,
  /* test */ "target": ["rc"],
  // test
  "testFileMatch": /* test */ [
    "examples/**/*.test.ts" /* test */,
    /* test */ "**/__typetests__/*.test.ts"
  ]
}
`;

    await writeFixture(fixture, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      failFast: true,
      target: ["rc"],
      testFileMatch: ["examples/**/*.test.ts", "**/__typetests__/*.test.ts"],
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});

describe("'--config' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixture);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--config"]);

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
