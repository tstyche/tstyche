import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchObject } from "./__utils__/matchObject.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_STORE_PATH' environment variable", () => {
  test("has default value", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    matchObject(normalizeOutput(stdout), {
      storePath: "<<cwd>>/tests/__fixtures__/.generated/config-storePath/.store",
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("when specified, uses the path", async () => {
    const storeUrl = new URL("./dummy-store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.equal(existsSync(storeUrl), false);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"], {
      env: {
        ["TSTYCHE_STORE_PATH"]: "./dummy-store",
      },
    });

    assert.equal(existsSync(storeUrl), true);

    assert.equal(
      normalizeOutput(stdout),
      "adds TypeScript 5.2.2 to <<cwd>>/tests/__fixtures__/.generated/config-storePath/dummy-store/5.2.2\n",
    );

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
