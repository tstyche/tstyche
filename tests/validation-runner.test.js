import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
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

describe("compiler options", () => {
  test("when TSConfig file has errors", async () => {
    const tsconfig = {
      compilerOptions: {
        noEmitOnError: true,
        strict: "yes",
        strictNullChecks: true,
      },
      extends: "../../tsconfig.json",
      include: ["**/*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tsconfig-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-tsconfig-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
