import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function () {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_STORE_PATH' environment variable", function () {
  test("has default value", async function () {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(normalizeOutput(stdout), {
      storePath: "<<cwd>>/tests/__fixtures__/.generated/config-storePath/.store",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when specified, uses the path", async function () {
    const storeUrl = new URL("./dummy-store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(storeUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"], {
      env: {
        ["TSTYCHE_STORE_PATH"]: "./dummy-store",
      },
    });

    assert.fileExists(storeUrl);

    assert.equal(
      normalizeOutput(stdout),
      "adds TypeScript 5.2.2 to <<cwd>>/tests/__fixtures__/.generated/config-storePath/dummy-store/5.2.2\n",
    );

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
