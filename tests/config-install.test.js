import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

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
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--install' command line option", function() {
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

  testCases.forEach(({ args, testCase }) => {
    test(testCase, async function() {
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
          "adds TypeScript 4.9.5 to <<cwd>>/tests/__fixtures__/.generated/config-install/.store/4.9.5",
          "",
        ].join("\n"),
      );

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });

  test("when 'target' configuration option is specified", async function() {
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
        "adds TypeScript 4.8.4 to <<cwd>>/tests/__fixtures__/.generated/config-install/.store/4.8.4",
        "adds TypeScript 5.0.4 to <<cwd>>/tests/__fixtures__/.generated/config-install/.store/5.0.4",
        "",
      ].join("\n"),
    );

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when 'current' target specified in the configuration file", async function() {
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

  test("when 'current' target specified in the command", async function() {
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
