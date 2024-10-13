import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("'--reporters' command line option", async (t) => {
  await t.test("'list' reporter", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", "list"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-list-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("'summary' reporter", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", "summary"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-summary-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("'list' with 'summary'", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", "list,summary"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-list-with-summary-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("'summary' with custom reporter", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--reporters",
      "summary,./custom-reporter.js",
    ]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-summary-with-custom-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("custom reporter", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", "./custom-reporter.js"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-custom-reporter-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
