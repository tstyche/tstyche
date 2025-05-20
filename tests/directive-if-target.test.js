import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

/**
 * @param {Array<string>} target
 */
function getIsStringTestText(target) {
  return `// @tstyche if { target: ["${target.join('", "')}"] }

import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;
}

/**
 * @param {Array<string>} target
 */
function getIsNumberTestText(target) {
  return `// @tstyche if { target: ["${target.join('", "')}"] }

import { expect, test } from "tstyche";

test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;
}

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'// @tstyche if { target: <range> }' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when single matching target is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText(["5.6"]),
      ["__typetests__/isNumber.tst.ts"]: getIsNumberTestText(["5.6.2"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "'>=5.5 <5.8'"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-matching-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when single NOT matching target is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText(["5.4"]),
      ["__typetests__/isNumber.tst.ts"]: getIsNumberTestText(["5.4.2"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "'>=5.5 <5.8'"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-not-matching-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when multiple matching target is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText(["5.6", "5.7"]),
      ["__typetests__/isNumber.tst.ts"]: getIsNumberTestText(["5.6.2", "5.7.2"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multiple-matching-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when multiple NOT matching target is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText(["5.3", "5.4"]),
      ["__typetests__/isNumber.tst.ts"]: getIsNumberTestText(["5.3.2", "5.4.2"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multiple-not-matching-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when matching version range is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText([">=5.6"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-matching-range-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when partly matching version range is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText([">=5.4"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-partly-matching-range-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when version range with an upper bound is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText([">=5.6 <5.7"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-matching-range-with-upper-bound-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when NOT matching version range is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: getIsStringTestText([">=5.6 <5.5"]),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-matching-range-with-upper-bound-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
