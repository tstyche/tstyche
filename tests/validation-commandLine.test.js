import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
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

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'tstyche' command", function() {
  test("handles unknown command line options", async function() {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--check", "--quick", "-t"]);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-unknown-options-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when no test files are present", async function() {
    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: "{}",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-no-test-files-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when search string does not select test files", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["sample"]);

    assert.equal(stdout, "");

    await matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-no-test-files-selected-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
