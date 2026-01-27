import { exec } from "node:child_process";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("@tstyche/tag", async (t) => {
  await t.test("passing test", (t, done) => {
    t.plan(1);

    const process = exec(`node ./__tests__/pass.test.js`, { cwd: fixtureUrl }, (_, stdout, stderr) => {
      assert.equal(stderr, "");
      assert.equal(stdout, "");
    });

    process.on("close", (code) => {
      t.assert.equal(code, 0);

      done();
    });
  });

  await t.test("failing test", (t, done) => {
    t.plan(1);

    const process = exec(`node ./__tests__/fail.test.js`, { cwd: fixtureUrl }, async (_, stdout, stderr) => {
      await assert.matchSnapshot(prettyAnsi(normalizeOutput(stderr)), {
        fileName: `${testFileName}-fail-stderr`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");
    });

    process.on("close", (code) => {
      t.assert.equal(code, 0);

      done();
    });
  });
});
