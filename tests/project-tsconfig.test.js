import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("TSConfig file", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when TSConfig file is missing, sets default compiler options", async () => {
    const testText = `import { expect, test } from "tstyche";

test("'strictNullChecks': true", () => {
  function x(a?: string) {
    return a;
  }

  expect(x()).type.not.toBe<string>();
});

test("'strictFunctionTypes': true", () => {
  function y(a: string) {
    return a;
  }

  expect<(a: string | number) => void>().type.not.toBeAssignableWith(y);
});

test("'useUnknownInCatchVariables': false", () => {
  try {
    //
  } catch (error) {
    expect(error).type.toBeAny();
  }
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-sets-default-compiler-options`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
