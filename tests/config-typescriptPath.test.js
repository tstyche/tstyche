import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
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

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_TYPESCRIPT_PATH' environment variable", function() {
  test("has default value", async function() {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    matchObject(normalizeOutput(stdout), {
      typescriptPath: "<<cwd>>/node_modules/typescript/lib/typescript.js",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  describe("'TSTYCHE_TYPESCRIPT_PATH' environment variable", function() {
    test("uses provided path", async function() {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"]);

      const typescriptPath = fileURLToPath(
        new URL("./.store/5.2.2/node_modules/typescript/lib/typescript.js", fixtureUrl),
      );

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
        env: {
          ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath,
        },
      });

      assert.match(stdout, /^uses TypeScript 5.2.2/);
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });
});
