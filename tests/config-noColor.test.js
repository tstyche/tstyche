import { afterEach, describe, test } from "node:test";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'TSTYCHE_NO_COLOR' environment variable", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("has default value", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
      env: { ["TSTYCHE_NO_COLOR"]: undefined },
    });

    assert.matchObject(stdout, {
      noColor: false,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when truthy, colors are disabled", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_NO_COLOR"]: "true" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tstycheNoColor-true-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when falsy, colors are enabled", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_NO_COLOR"]: "" },
    });

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-tstycheNoColor-false-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when 'NO_COLOR' is truthy, colors are disabled", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "true",
        ["TSTYCHE_NO_COLOR"]: undefined,
      },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-noColors-true-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when 'NO_COLOR' is falsy, colors are enabled", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "",
        ["TSTYCHE_NO_COLOR"]: undefined,
      },
    });

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-noColors-false-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("overrides 'NO_COLOR' and enables colors", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "true",
        ["TSTYCHE_NO_COLOR"]: "",
      },
    });

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-tstycheNoColor-false-overrides-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("overrides 'NO_COLOR' and disables colors", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "",
        ["TSTYCHE_NO_COLOR"]: "true",
      },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tstycheNoColor-true-overrides-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
