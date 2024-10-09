import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("'--plugins' command line option", async (t) => {
  await t.test("when single plugin has 'config' hook", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--plugins",
      "./config-plugin-1.js",
      "--showConfig",
    ]);

    assert.matchObject(stdout, {
      failFast: true,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when multiple plugins have 'config' hook", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--plugins",
      "./config-plugin-1.js,./config-plugin-2.js,config-plugin-3.js",
      "--showConfig",
    ]);

    assert.matchObject(stdout, {
      failFast: true,
      testFileMatch: [],
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
