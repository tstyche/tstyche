import { afterEach, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

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
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

test("when syntax errors are encountered", async function() {
  await writeFixture(fixtureUrl, {
    ["__typetests__/dummy.test.ts"]: isStringTestText,
    ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
  });

  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-syntax-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-syntax-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
