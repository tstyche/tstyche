import { exec } from "node:child_process";
import test from "node:test";
import { promisify } from "node:util";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("@tstyche/tag", async (t) => {
  await t.test("passing test", async () => {
    const { stderr, stdout } = await promisify(exec)(`node ./__tests__/pass.test.js`, { cwd: fixtureUrl });

    assert.equal(stderr, "");
    assert.equal(stdout, "");
  });

  await t.test("failing test", async () => {
    const { stderr, stdout } = await promisify(exec)(`node ./__tests__/fail.test.js`, { cwd: fixtureUrl });

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(stderr)), {
      fileName: `${testFileName}-fail-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
  });
});
