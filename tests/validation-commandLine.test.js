import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'tstyche' command", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("handles unknown command line options", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--check", "--quick", "-t"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-unknown-options-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when no test files are present", async () => {
    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: "{}",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-no-test-files-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when search string does not select test files", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["sample"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-no-test-files-selected-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });
});
