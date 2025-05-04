import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("template", async (t) => {
  // TODO remove this check after dropping support for Node.js 20
  if (process.versions.node.startsWith("20")) {
    t.skip();

    return;
  }

  await t.test("template", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--import ts-blank-space/register" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
