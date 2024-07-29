import { afterEach, describe, test } from "poku";
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

await describe("'TSTYCHE_NPM_REGISTRY' environment variable", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("has default value", async () => {
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

  await test("when registry is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.5.2"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://registry.yarnpkg.com",
      },
    });

    assert.match(stdout, /^adds TypeScript 5.5.2/);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
