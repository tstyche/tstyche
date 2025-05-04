import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("template test file", async (t) => {
  await t.test("must export a string", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["must-export-a-string"], {
      env: { ["NODE_OPTIONS"]: "--import ts-blank-space/register" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-must-export-a-string-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-must-export-a-string-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  // await t.test("handles test level type errors", async () => {
  //   const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-level"]);

  //   await assert.matchSnapshot(normalizeOutput(stdout), {
  //     fileName: `${testFileName}-test-level-errors-stdout`,
  //     testFileUrl: import.meta.url,
  //   });

  //   await assert.matchSnapshot(stderr, {
  //     fileName: `${testFileName}-test-level-errors-stderr`,
  //     testFileUrl: import.meta.url,
  //   });

  //   assert.equal(exitCode, 1);
  // });
});
