import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'TSTYCHE_FETCH_TIMEOUT' environment variable", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("has default value", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      fetchTimeout: 30,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when timeout is specified", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
      env: {
        ["TSTYCHE_FETCH_TIMEOUT"]: "60",
      },
    });

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      fetchTimeout: 60,
    });

    assert.equal(exitCode, 0);
  });
});
