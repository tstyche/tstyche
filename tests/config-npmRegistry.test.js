import { test } from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'TSTYCHE_NPM_REGISTRY' environment variable", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("has default value", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(stdout, {
      npmRegistry: "https://registry.npmjs.org",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when registry is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.4"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://registry.yarnpkg.com",
      },
    });

    assert.match(stdout, /^adds TypeScript 5.4.5/);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
