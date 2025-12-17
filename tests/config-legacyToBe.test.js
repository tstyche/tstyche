import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isLegacyToBeText = `import { expect } from "tstyche";

expect<{ a: string } & { b: number }>().type.toBe<{ a: string; b: number }>();
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'legacyToBe' config file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when enabled", async () => {
    const config = {
      legacyToBe: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isLegacyToBe.test.ts"]: isLegacyToBeText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-enabled-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when disabled", async () => {
    const config = {
      legacyToBe: false,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isLegacyToBe.test.ts"]: isLegacyToBeText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
