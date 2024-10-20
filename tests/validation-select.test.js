import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const pluginText = `import path from "node:path";
export default {
  config: (resolvedConfig) => {
    return { ...resolvedConfig, testFileMatch: [] /* disables look up */ };
  },
  select: () => {
    return [
      path.resolve("./__typetests__/toBeNotfound.test.ts"),
      path.resolve("./__typetests__/isString.test.ts")
    ];
  },
};
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'select' hook", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when test file does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["plugin.js"]: pluginText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--plugins", "./plugin.js"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
