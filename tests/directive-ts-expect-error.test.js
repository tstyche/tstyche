import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'// @ts-expect-error' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when message matches", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'
console.log(add);

// @ts-expect-error: Cannot find name 'add'
console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised
console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.config.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-matches-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when a blank line occurs in-between", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'

console.log(add);

// @ts-expect-error: Cannot find name 'add'

console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised

console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.config.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-blank-line-in-between-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when message does not match", async () => {
    const testFileText = `// @ts-expect-error Does not work
console.log(add);

// @ts-expect-error: Does not work
console.log(add);

// @ts-expect-error Does not work -- Only one error raised
console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.config.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-does-not-match-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-does-not-match-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when check is disabled", async () => {
    const testFileText = `// @ts-expect-error!
console.log(add);

// @ts-expect-error! Does not work
console.log(add);

// @ts-expect-error! Does not work
console.log(add);

// @ts-expect-error! Does not work -- Only one error raised
console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.config.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when multiple errors are suppressed", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'
console.log(add); console.log(add);

// @ts-expect-error: Cannot find name 'add'
console.log(add); console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised
console.log(add); console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.config.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-multiple-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multiple-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
