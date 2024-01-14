import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["./"],
};

const fixture = "validation-store";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("warns if resolution of a tag may be outdated", () => {
  test.each([
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
  ])("$testCase", async ({ target }) => {
    const storeManifest = {
      $version: "1",
      lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000 /* 2 hours and 15 minutes */,
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

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { stderr } = await spawnTyche(fixture, ["--showConfig", "--target", target], {
      env: { ["TSTYCHE_TIMEOUT"]: "0.001" },
    });

    expect(stderr).toMatch(
      [
        "Warning: Failed to update metadata of the 'typescript' package from the registry.",
        `The resolution of the '${target}' tag may be outdated.`,
      ].join("\r\n\r\n"),
    );
  });
});

describe("does not warn if resolution of a tag may be outdated", () => {
  test.each([
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
  ])("$testCase", async ({ target }) => {
    const storeManifest = {
      $version: "1",
      lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000 /* 2 hours and 15 minutes */,
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

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { stderr } = await spawnTyche(fixture, ["--showConfig", "--target", target], {
      env: { ["TSTYCHE_TIMEOUT"]: "0.001" },
    });

    expect(stderr).toBe("");
  });
});
