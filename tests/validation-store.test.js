import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("store", function () {
  afterEach(async function () {
    await clearFixture(fixtureUrl);
  });

  test("when fetching of metadata from the registry times out", async function () {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.1"], {
      env: {
        ["TSTYCHE_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://registry.npmjs.org/'.",
      "",
      "Setup timeout of 0.001s was exceeded.",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  test("when installing 'typescript' times out", async function () {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.1"], {
      env: {
        ["TSTYCHE_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to install 'typescript@5.1.6'.",
      "",
      "Error: setup timeout of 0.001s was exceeded",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  describe("warns if resolution of a tag may be outdated", function () {
    const testCases = [
      {
        target: "5.3.4",
        testCase: "when a patch version higher than 'latest' is requested",
      },
      {
        target: "5.3",
        testCase: "when a minor version equal to 'latest' is requested",
      },
      {
        target: "5.4",
        testCase: "when a minor version higher than 'latest' is requested",
      },
      {
        target: "6",
        testCase: "when a major version higher than 'latest' is requested",
      },

      {
        target: "beta",
        testCase: "when 'beta' tag is requested",
      },
      {
        target: "latest",
        testCase: "when 'latest' tag is requested",
      },
      {
        target: "next",
        testCase: "when 'next' tag is requested",
      },
      {
        target: "rc",
        testCase: "when 'rc' tag is requested",
      },
    ];

    testCases.forEach(({ target, testCase }) => {
      test(testCase, async function () {
        const storeManifest = {
          $version: "1",
          lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
          resolutions: {
            ["5.2"]: "5.2.2",
            ["5.3"]: "5.3.3",
            beta: "5.3.0-beta",
            latest: "5.3.3",
            next: "5.4.0-dev.20240112",
            rc: "5.3.1-rc",
          },
          versions: ["5.3.2", "5.3.3"],
        };

        await writeFixture(fixtureUrl, {
          [".store/store-manifest.json"]: JSON.stringify(storeManifest),
          ["__typetests__/dummy.test.ts"]: isStringTestText,
        });

        const { stderr } = await spawnTyche(fixtureUrl, ["--showConfig", "--target", target], {
          env: {
            ["TSTYCHE_TIMEOUT"]: "0.001",
          },
        });

        const expected = [
          "Warning: Failed to update metadata of the 'typescript' package from the registry.",
          "",
          `The resolution of the '${target}' tag may be outdated.`,
        ].join("\n");

        assert.match(stderr, new RegExp(`^${expected}`));
      });
    });
  });

  describe("does not warn if resolution of a tag may be outdated", function () {
    const testCases = [
      {
        target: "5.3.3",
        testCase: "when a patch version equal to 'latest' is requested",
      },
      {
        target: "5.2.2",
        testCase: "when a patch version lower than 'latest' is requested",
      },
      {
        target: "5.2",
        testCase: "when a minor version lower than 'latest' is requested",
      },
    ];

    testCases.forEach(({ target, testCase }) => {
      test(testCase, async function () {
        const storeManifest = {
          $version: "1",
          lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
          resolutions: {
            ["5.2"]: "5.2.2",
            ["5.3"]: "5.3.3",
            beta: "5.3.0-beta",
            latest: "5.3.3",
            next: "5.4.0-dev.20240112",
            rc: "5.3.1-rc",
          },
          versions: ["5.2.2", "5.3.2", "5.3.3"],
        };

        await writeFixture(fixtureUrl, {
          [".store/store-manifest.json"]: JSON.stringify(storeManifest),
          ["__typetests__/dummy.test.ts"]: isStringTestText,
        });

        const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--showConfig", "--target", target], {
          env: {
            ["TSTYCHE_TIMEOUT"]: "0.001",
          },
        });

        assert.equal(stderr, "");
        assert.equal(exitCode, 0);
      });
    });
  });
});
