import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'// @tstyche if { target: <range> }' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is not a string", async () => {
    const testFileText = `// @tstyche if { target: ["5.6"] }

import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-wrong-option-value-type-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when there are no supported TypeScript versions matching the range", async () => {
    const testFileText = `// @tstyche if { target: ">=5.0 <5.4" }

  import { expect, test } from "tstyche";

  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
  `;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-no-supported-versions-matching-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-no-supported-versions-matching-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified", async () => {
    const testFileText = `// @tstyche if { target: "new" }

  import { expect, test } from "tstyche";

  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
  `;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-supported-version-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-supported-version-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified within a union", async () => {
    const testFileText = `// @tstyche if { target: ">=5.4 <=5.6 || new" }

  import { expect, test } from "tstyche";

  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
  `;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-supported-version-within-union-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-supported-version-within-union-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified", async () => {
    const testFileText = `// @tstyche if { target: "5.4 >=5.6" }

  import { expect, test } from "tstyche";

  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
  `;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-valid-range-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-valid-range-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified within a union", async () => {
    const testFileText = `// @tstyche if { target: ">=5.4 || 5.6 >5.8" }

  import { expect, test } from "tstyche";

  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
  `;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-valid-range-within-union-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-valid-range-within-union-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
