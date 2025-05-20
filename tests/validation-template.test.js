import process from "node:process";
import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'// @tstyche template' directive", async (t) => {
  // TODO remove this check after dropping support for Node.js 20
  if (process.versions.node.startsWith("20")) {
    t.skip();

    return;
  }

  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("does not take an argument", async () => {
    const testFileText = `// @tstyche template nope

let testText = \`import { expect, test } from "tstyche";
\`;

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().type.toBe<\${target}>();
});
\`;
}

export default testText;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-does-not-take-argument-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-does-not-take-argument-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("must export a string", async () => {
    const testFileText = `// @tstyche template

let testText = \`import { expect, test } from "tstyche";
\`;

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().type.toBe<\${target}>();
});
\`;
}

export default () => testText;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
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
    const testFileText = `// @tstyche template

let testText = \`import { expect, test } from "tstyche";
\`;

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().type.toBe<\${target}>();
});
\`;
}

export { testText };
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
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
    const testFileText = `// @tstyche template

function getTestText() {
  return \`import { expect, test } from "tstyche";
expect<string>().type.toBe<string>();
\`;
}

export default getTestText(;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-file-syntax-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-file-syntax-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test file type errors", async () => {
    const testFileText = `// @tstyche template

let testText = \`import { expect, test } from "tstyche";
\`;

export const a: number = "nine";

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().type.toBe<\${target}>();
});
\`;
}

export default testText;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-file-type-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-file-type-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test text syntax errors", async () => {
    const testFileText = `// @tstyche template

const testText = \`import { expect, test } from "tstyche";

declare function one(a: string): void;

test("is syntax error?", () => {
  one(());
});

test("is syntax error?", () => {
  one(
});

test("is skipped?", () => {
  expect(one("abc")).type.toBe<void>();
});

test("is broken?"
\`;

export default testText;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-text-syntax-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-text-syntax-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles test text type errors", async () => {
    const testFileText = `// @tstyche template

let testText = \`import { expect, test } from "tstyche";
\`;

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().toBe<\${target}>();
});
\`;
}

export default testText;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-text-type-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-text-type-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
