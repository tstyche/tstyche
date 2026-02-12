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

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--fetch' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  const testCases = [
    {
      args: ["--fetch", "--target", "5.6"],
      testCase: "when '--target' command line option is specified",
    },
    {
      args: ["--fetch", "false", "--target", "5.6"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--fetch", "--target", "5.6"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--fetch", "feature", "--target", "5.6"],
      testCase: "ignores search string specified after the option",
    },
  ];

  for (const { args, testCase } of testCases) {
    await t.test(testCase, async () => {
      const config = { target: "5.6 || latest" };

      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.equal(stderr, "");

      assert.equal(
        normalizeOutput(stdout),
        [
          "adds TypeScript 5.6.3 to <<basePath>>/tests/__fixtures__/.generated/config-fetch/.store/typescript@5.6.3",
          "",
        ].join("\n"),
      );

      assert.equal(exitCode, 0);
    });
  }

  await t.test("when 'target' configuration option is specified", async () => {
    const config = { target: "5.6 || 5.8" };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--fetch"]);

    assert.equal(stderr, "");

    assert.equal(
      normalizeOutput(stdout),
      [
        "adds TypeScript 5.6.3 to <<basePath>>/tests/__fixtures__/.generated/config-fetch/.store/typescript@5.6.3",
        "adds TypeScript 5.8.3 to <<basePath>>/tests/__fixtures__/.generated/config-fetch/.store/typescript@5.8.3",
        "",
      ].join("\n"),
    );

    assert.equal(exitCode, 0);
  });

  await t.test("when '*' target specified in the configuration file", async () => {
    const config = { target: "*" };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--fetch"]);

    assert.equal(stderr, "");
    assert.equal(stdout, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when '*' target specified in the command", async () => {
    const config = { target: "5.6 || latest" };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--fetch", "--target", '"*"']);

    assert.equal(stderr, "");
    assert.equal(stdout, "");
    assert.equal(exitCode, 0);
  });
});
