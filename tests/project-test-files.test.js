import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("test files", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("allows a file to be empty", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: "",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-empty-file`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only an empty describe", async () => {
    const testText = `import { describe } from "tstyche";
describe("parent", () => {
  describe("empty describe", function () {
    // no test
  });
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-empty-describe`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only skipped describe", async () => {
    const testText = `import { describe } from "tstyche";
describe.skip("skipped describe", function () {
  test("is skipped?", () => {
    expect<void>().type.toBe<void>();
  });
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skipped-describe`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only todo describe", async () => {
    const testText = `import { describe } from "tstyche";
describe.todo("have todo this", () => {});
describe.todo("and this one");
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-describe`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only empty test", async () => {
    const testText = `import { describe, test } from "tstyche";
test("empty test", () => {
  // no assertion
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-empty-test`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only skipped test", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
test.skip("is skipped?", () => {
  expect<void>().type.toBe<void>();
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skipped-test`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only todo test", async () => {
    const testText = `import { describe, test } from "tstyche";
test.todo("have todo this", () => {});
test.todo("and this one");
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-test`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("allows a file to have only expect", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
expect<number>().type.toBe<number>();
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-only-expect`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
