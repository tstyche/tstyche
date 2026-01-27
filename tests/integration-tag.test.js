import { exec } from "node:child_process";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;
const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBe<string>();
});
`;

const passTestText = `import tstyche from "tstyche/tag";
await tstyche\`isString --quiet\`;
`;
const failTestText = `import tstyche from "tstyche/tag";
await tstyche\`isNumber --quiet\`;
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

test("@tstyche/tag", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__tests__/pass.test.js"]: passTestText,
    ["__tests__/fail.test.js"]: failTestText,

    ["__typetests__/isString.test.ts"]: isStringTestText,
    ["__typetests__/isNumber.test.ts"]: isNumberTestText,
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

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
      t.assert.equal(code, 1);

      done();
    });
  });
});
