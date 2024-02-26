import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchObject } from "./__utils__/matchObject.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_NO_INTERACTIVE' environment variable", () => {
  test("has default value", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    matchObject(stdout, { noInteractive: true });
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tstycheNoInteractive-true-stdout`,
      testFileUrl: import.meta.url,
    });
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
      fileName: `${testFileName}-tstycheNoInteractive-false-stdout`,
      testFileUrl: import.meta.url,
    });
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
