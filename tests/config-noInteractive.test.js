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

describe("'TSTYCHE_NO_INTERACTIVE' environment variable", function() {
  test("has default value", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    matchObject(stdout, {
      noInteractive: true,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when truthy, interactive elements are disabled", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["TSTYCHE_NO_INTERACTIVE"]: "true",
      },
    });

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tstycheNoInteractive-true-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when falsy, interactive elements are enabled", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["TSTYCHE_NO_INTERACTIVE"]: "",
      },
    });

    await matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-tstycheNoInteractive-false-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
