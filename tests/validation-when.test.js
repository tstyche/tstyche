import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("when", async (t) => {
  await t.test("argument validation", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["when"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-argument-validation-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-argument-validation-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles nested 'describe' or 'test'", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["handles-nested"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-handles-nested-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-handles-nested-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles not supported action", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["action-not-supported"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-action-not-supported-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-action-not-supported-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
