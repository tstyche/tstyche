import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("single-line '@ts-expect-error' directive", async (t) => {
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
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-matches-stdout`,
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
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-single-line-does-not-match-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-does-not-match-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("with blank lines", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'

console.log(add);

// @ts-expect-error: Cannot find name 'add'

console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised

console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-blank-line-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("with indents", async () => {
    const testFileText = `  // @ts-expect-error Should handle leading spaces
  console.log(spaces);

\t// @ts-expect-error Should handle leading tabs
\tconsole.log(tabs);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-single-line-indents-stderr`,
      testFileUrl: import.meta.url,
    });
    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-indents-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when message is truncated", async () => {
    const testFileText = `let a: Promise<string>;

// @ts-expect-error Type 'number' is not assignable to type 'Promise<string>'.
a = 123;
// @ts-expect-error Type 'boolean' is not assignable to type 'Promise<...>' -- Allows messages to be truncated
a = true;
// @ts-expect-error Type '...' is not assignable to type 'Promise<string>'
a = true;
// @ts-expect-error Type 'boolean' is not assignable to type 'Array<...>'
a = true;
// @ts-expect-error Type 'Promise<...>' is not assignable to type type 'Promise<string>'
a = true;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-single-line-truncated-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-truncated-stdout`,
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
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
