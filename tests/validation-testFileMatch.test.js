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

describe("'testFileMatch' configuration file option", () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  const testCases = [
    {
      segment: "/",
      testCase: "when a pattern starts with '/'",
    },
    {
      segment: "../",
      testCase: "when a pattern starts with '../'",
    },
  ];

  testCases.forEach(({ segment, testCase }, index) => {
    test(testCase, async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify({ testFileMatch: [`${segment}feature`] }, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stdout, "");

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-cannot-start-with-${index}`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 1);
    });
  });

  test("when option value is not a list", async () => {
    const config = {
      testFileMatch: "feature",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when item of the list is not a string", async () => {
    const config = {
      testFileMatch: ["examples/*", false],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-list-item-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
