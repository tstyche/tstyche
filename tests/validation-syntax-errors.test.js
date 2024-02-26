import { strict as assert } from "node:assert";
import { afterEach, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";

declare function one(a: string): void;

test("is syntax error?", () => {
  one(());
});

test("is syntax error?", () => {
  one(
});

test("is skipped?", () => {
  expect(one("abc")).type.toBeVoid();
});

test("is broken?"
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

test("when syntax errors are encountered", async () => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/dummy.test.ts"]: isStringTestText,
    ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
  });

  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-syntax-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-syntax-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
