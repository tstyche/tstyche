import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("expect", async (t) => {
  await t.test("handles nested 'describe' or 'test'", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["handles-nested"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-handles-nested-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-handles-nested-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("not supported matcher", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["not-supported-matcher"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-supported-matcher-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-supported-matcher-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("assertion chain", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["assertion-chain"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-assertion-chain-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-assertion-chain-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
