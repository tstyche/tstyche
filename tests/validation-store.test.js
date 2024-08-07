import { afterEach, describe, test } from "poku";
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

await describe("store", async () => {
  if (process.versions.node.startsWith("16")) {
    // store is not supported on Node.js 16
    return;
  }

  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when fetch request of metadata fails with 404", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://tstyche.org",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://tstyche.org'.",
      "",
      "The request failed with status code 404.",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  await test("when fetch request of metadata times out", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
      env: {
        ["TSTYCHE_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://registry.npmjs.org'.",
      "",
      "The request timeout of 0.001s was exceeded.",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  await test("when fetch request of metadata fails", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://nothing.tstyche.org",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://nothing.tstyche.org'.",
      "",
      "Might be there is an issue with the registry or the network connection.",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  await test("when installing 'typescript' times out", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    await spawnTyche(fixtureUrl, ["--update"]);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.1"], {
      env: {
        ["TSTYCHE_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to install 'typescript@5.1.6'.",
      "",
      "The request timeout of 0.001s was exceeded.",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  await describe("warns if resolution of a tag may be outdated", async () => {
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

    for (const { target, testCase } of testCases) {
      await test(testCase, async () => {
        const storeManifest = {
          $version: "2",
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
          "Warning: Failed to update metadata of the 'typescript' package from 'https://registry.npmjs.org'.",
          "",
          `The resolution of the '${target}' tag may be outdated.`,
        ].join("\n");

        assert.match(stderr, new RegExp(`^${expected}`));
      });
    }
  });

  await describe("does not warn if resolution of a tag may be outdated", async () => {
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

    for (const { target, testCase } of testCases) {
      await test(testCase, async () => {
        const storeManifest = {
          $version: "2",
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
    }
  });

  await describe("suppresses fetch errors if resolution of a tag may be outdated", async () => {
    await test("when fetch request of metadata fails with 404", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      await spawnTyche(fixtureUrl, ["--target", "5.2"]);

      const storeManifest = {
        $version: "2",
        lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
        packages: {
          "5.2.2": {
            integrity: "sha512-mI4WrpHsbCIcwT9cF4FZvr80QUeKvsUsUvKDoR+X/7XHQH98xYD8YHZg7ANtz2GtZt/CBq2QJ0thkGJMHfqc1w==",
            tarball: "https://registry.npmjs.org/typescript/-/typescript-5.2.2.tgz"
          },
          "5.3.3": {
            integrity: "sha512-pXWcraxM0uxAS+tN0AG/BF2TyqmHO014Z070UsJ+pFvYuRSq8KH8DmWpnbXe0pEPDHXZV3FcAbJkijJ5oNEnWw==",
            tarball: "https://registry.npmjs.org/typescript/-/typescript-5.3.3.tgz"
          }
        },
        resolutions: {
          ["5.2"]: "5.2.2",
          ["5.3"]: "5.3.3",
        },
        versions: ["5.2.2", "5.3.2", "5.3.3"],
      };

      await writeFixture(fixtureUrl, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      });

      const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
        env: {
          ["TSTYCHE_NPM_REGISTRY"]: "https://tstyche.org",
        },
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await test("when fetch request of metadata times out", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      await spawnTyche(fixtureUrl, ["--target", "5.2"]);

      const storeManifest = {
        $version: "2",
        lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
        packages: {
          "5.2.2": {
            integrity: "sha512-mI4WrpHsbCIcwT9cF4FZvr80QUeKvsUsUvKDoR+X/7XHQH98xYD8YHZg7ANtz2GtZt/CBq2QJ0thkGJMHfqc1w==",
            tarball: "https://registry.npmjs.org/typescript/-/typescript-5.2.2.tgz"
          },
          "5.3.3": {
            integrity: "sha512-pXWcraxM0uxAS+tN0AG/BF2TyqmHO014Z070UsJ+pFvYuRSq8KH8DmWpnbXe0pEPDHXZV3FcAbJkijJ5oNEnWw==",
            tarball: "https://registry.npmjs.org/typescript/-/typescript-5.3.3.tgz"
          }
        },
        resolutions: {
          ["5.2"]: "5.2.2",
          ["5.3"]: "5.3.3",
        },
        versions: ["5.2.2", "5.3.2", "5.3.3"],
      };

      await writeFixture(fixtureUrl, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      });

      const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
        env: {
          ["TSTYCHE_TIMEOUT"]: "0.001",
        },
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await test("when fetch request of metadata fails", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      await spawnTyche(fixtureUrl, ["--target", "5.2"]);

      const storeManifest = {
        $version: "2",
        lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
        packages: {
          "5.2.2": {
            integrity: "sha512-mI4WrpHsbCIcwT9cF4FZvr80QUeKvsUsUvKDoR+X/7XHQH98xYD8YHZg7ANtz2GtZt/CBq2QJ0thkGJMHfqc1w==",
            tarball: "https://registry.npmjs.org/typescript/-/typescript-5.2.2.tgz"
          },
          "5.3.3": {
            integrity: "sha512-pXWcraxM0uxAS+tN0AG/BF2TyqmHO014Z070UsJ+pFvYuRSq8KH8DmWpnbXe0pEPDHXZV3FcAbJkijJ5oNEnWw==",
            tarball: "https://registry.npmjs.org/typescript/-/typescript-5.3.3.tgz"
          }
        },
        resolutions: {
          ["5.2"]: "5.2.2",
          ["5.3"]: "5.3.3",
        },
        versions: ["5.2.2", "5.3.2", "5.3.3"],
      };

      await writeFixture(fixtureUrl, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      });

      const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
        env: {
          ["TSTYCHE_NPM_REGISTRY"]: "https://nothing.tstyche.org",
        },
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });
});
