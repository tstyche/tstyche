import { afterEach, describe, test } from "poku";
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

await describe("compiler options", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when TSConfig file has errors", async () => {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tsconfig-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-tsconfig-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
