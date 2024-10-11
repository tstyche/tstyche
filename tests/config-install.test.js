import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--install' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  const testCases = [
    {
      args: ["--install", "--target", "4.9"],
      testCase: "when '--target' command line option is specified",
    },
    {
      args: ["--install", "false", "--target", "4.9"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--install", "--target", "4.9"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--install", "feature", "--target", "4.9"],
      testCase: "ignores search string specified after the option",
    },
  ];

  for (const { args, testCase } of testCases) {
    await t.test(testCase, async () => {
      const config = { target: ["5.0", "latest"] };

      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.equal(
        normalizeOutput(stdout),
        [
          "adds TypeScript 4.9.5 to <<basePath>>/tests/__fixtures__/.generated/config-install/.store/typescript@4.9.5",
          "",
        ].join("\n"),
      );

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  }

  await t.test("when 'target' configuration option is specified", async () => {
    const config = { target: ["4.8", "5.0"] };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install"]);

    assert.equal(
      normalizeOutput(stdout),
      [
        "adds TypeScript 4.8.4 to <<basePath>>/tests/__fixtures__/.generated/config-install/.store/typescript@4.8.4",
        "adds TypeScript 5.0.4 to <<basePath>>/tests/__fixtures__/.generated/config-install/.store/typescript@5.0.4",
        "",
      ].join("\n"),
    );

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when 'current' target specified in the configuration file", async () => {
    const config = { target: ["current"] };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install"]);

    assert.equal(stdout, "");
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when 'current' target specified in the command", async () => {
    const config = { target: ["5.0", "latest"] };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install", "--target", "current"]);

    assert.equal(stdout, "");
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
