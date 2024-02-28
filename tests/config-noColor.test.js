import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { matchObject, matchSnapshot } from "./__utilities__/assert.js";
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

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_NO_COLOR' environment variable", function() {
  test("has default value", async function() {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
      env: { ["TSTYCHE_NO_COLOR"]: undefined },
    });

    matchObject(stdout, {
      noColor: false,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when truthy, colors are disabled", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_NO_COLOR"]: "true" },
    });

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tstycheNoColors-true-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when falsy, colors are enabled", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_NO_COLOR"]: "" },
    });

    await matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-tstycheNoColors-false-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when 'NO_COLOR' is truthy, colors are disabled", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "true",
        ["TSTYCHE_NO_COLOR"]: undefined,
      },
    });

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-noColors-true-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when 'NO_COLOR' is falsy, colors are enabled", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "",
        ["TSTYCHE_NO_COLOR"]: undefined,
      },
    });

    await matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-noColors-false-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("overrides 'NO_COLOR' and enables colors", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "true",
        ["TSTYCHE_NO_COLOR"]: "",
      },
    });

    await matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-tstycheNoColors-false-overrides-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("overrides 'NO_COLOR' and disables colors", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["NO_COLOR"]: "",
        ["TSTYCHE_NO_COLOR"]: "true",
      },
    });

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tstycheNoColors-true-overrides-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
