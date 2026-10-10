import test from "node:test";
import { fileURLToPath } from "node:url";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--root' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("sets root of a test project", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "./temp", "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("collects test files starting from the root directory", async () => {
    await writeFixture(fixtureUrl, {
      ["project/isString.tst.ts"]: isStringTestText,
      ["isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "project"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-files-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("searches for 'tsconfig.json' until the root directory", async () => {
    await writeFixture(fixtureUrl, {
      ["project/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "project"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-tsconfig-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("searches for configuration file in the root directory", async () => {
    await writeFixture(fixtureUrl, {
      ["project/tstyche.json"]: JSON.stringify({}, null, 2),
      ["tstyche.json"]: JSON.stringify({}, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "project", "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      configFilePath: "<<basePath>>/tests/__fixtures__/.generated/config-root/project/tstyche.json",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when absolute path is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const root = fileURLToPath(new URL("./temp", fixtureUrl));

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", root, "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when URL string is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const root = new URL("./temp", fixtureUrl).toString();

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", root, "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });
});
