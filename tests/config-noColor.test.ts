import { afterEach, describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["./"],
};

const fixture = "config-noColor";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'TSTYCHE_NO_COLOR' environment variable", () => {
  test("has default value", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: { ["TSTYCHE_NO_COLOR"]: undefined },
    });

    expect(JSON.parse(stdout)).toHaveProperty("noColor");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when truthy, colors are disabled", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: { ["TSTYCHE_NO_COLOR"]: "true" },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when falsy, colors are enabled", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: { ["TSTYCHE_NO_COLOR"]: "" },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'NO_COLOR' is truthy, colors are disabled", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: {
        ["NO_COLOR"]: "true",
        ["TSTYCHE_NO_COLOR"]: undefined,
      },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'NO_COLOR' is falsy, colors are enabled", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: {
        ["NO_COLOR"]: "",
        ["TSTYCHE_NO_COLOR"]: undefined,
      },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("overrides 'NO_COLOR' and enables colors", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: {
        ["NO_COLOR"]: "true",
        ["TSTYCHE_NO_COLOR"]: "",
      },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("overrides 'NO_COLOR' and disables colors", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: {
        ["NO_COLOR"]: "",
        ["TSTYCHE_NO_COLOR"]: "true",
      },
    });

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
