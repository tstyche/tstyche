import fs from "node:fs/promises";
import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });
const storeUrl = new URL("./.store/", fixtureUrl);

await test("'--list' command line option", async (t) => {
  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await writeFixture(fixtureUrl, {
    ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
    ["__typetests__/isString.tst.ts"]: isStringTestText,
  });

  await spawnTyche(fixtureUrl, ["--update"]);

  const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });

  const { resolutions, versions } = /** @type {{ resolutions: Record<string, string>, versions: Array<string> }} */ (
    JSON.parse(manifestText)
  );

  const expected = `${JSON.stringify({ resolutions, versions }, null, 2)}\n`;

  await t.test("lists tags and versions", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--list"]);

    assert.equal(stderr, "");
    assert.equal(stdout, expected);

    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified before the option", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["isNumber", "--list"]);

    assert.equal(stderr, "");
    assert.equal(stdout, expected);

    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified after the option", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--list", "isString"]);

    assert.equal(stderr, "");
    assert.equal(stdout, expected);

    assert.equal(exitCode, 0);
  });
});
