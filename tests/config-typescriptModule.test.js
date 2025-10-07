import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'TSTYCHE_TYPESCRIPT_MODULE' environment variable", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("has default value", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      typescriptModule: "<<baseUrl>>/node_modules/typescript/lib/typescript.js",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when path is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    await spawnTyche(fixtureUrl, ["--fetch", "--target", "5.2.2"]);

    const typescriptModule = new URL("./.store/typescript@5.2.2/lib/typescript.js", fixtureUrl).toString();

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["TSTYCHE_TYPESCRIPT_MODULE"]: typescriptModule,
      },
    });

    assert.equal(stderr, "");
    assert.match(stdout, /uses TypeScript 5.2.2/);
    assert.equal(exitCode, 0);
  });
});
