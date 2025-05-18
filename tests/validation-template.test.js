import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("template test file", async (t) => {
  // TODO remove this check after dropping support for Node.js 20
  if (process.versions.node.startsWith("20")) {
    t.skip();

    return;
  }

  await t.test("must export a string", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["must-export-a-string"], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
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

  await t.test("handles missing export", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["missing-export"], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-missing-export-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-missing-export-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test file syntax errors", async () => {
    const templateText = `// @tstyche template

function getTestText() {
  return \`import { expect, test } from "tstyche";
expect<string>().type.toBe<string>();
\`;
}

export default getTestText(;
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/template.tst.ts"]: templateText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["template"], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-file-syntax-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-file-syntax-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test file type errors", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-file-type"], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-file-type-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-file-type-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test text syntax errors", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-text-syntax"], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-text-syntax-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-text-syntax-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test text type errors", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-text-type"], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-text-type-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-text-type-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
