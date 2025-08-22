import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const ambientFileText = `declare module "ambient-example" {
  interface CustomOptions {
    test: boolean;
  }
}

export type ParseKeys<const Context extends {}> = Context;

false();
`;

const declarationFileText = `export declare function concat(a: string, b: string): string;

false();
`;

const sourceFileText = `export type Sample = { a: string };

false();
`;

const isSampleTestText = `import { expect } from "tstyche";
import { concat } from "./concat.js";
import { type Sample } from "./Sample.js";

expect(concat("a", "b")).type.toBe<string>();
expect<Sample>().type.toBe<{ a: string }>();
`;

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  compilerOptions: {
    skipLibCheck: true, // must be ignored, if 'checkDeclarationFiles' is enabled
  },
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'checkDeclarationFiles' config file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when enabled", async () => {
    const config = {
      checkDeclarationFiles: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/ambient.d.ts"]: ambientFileText,
      ["__typetests__/concat.d.ts"]: declarationFileText,
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isSample.test.ts"]: isSampleTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["__typetests__/Sample.ts"]: sourceFileText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-enabled-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when disabled", async () => {
    const config = {
      checkDeclarationFiles: false,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/ambient.d.ts"]: ambientFileText,
      ["__typetests__/concat.d.ts"]: declarationFileText,
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isSample.test.ts"]: isSampleTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["__typetests__/Sample.ts"]: sourceFileText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
