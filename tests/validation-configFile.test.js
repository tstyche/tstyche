import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'tstyche.config.json' file", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("handles unknown options", async () => {
    const configText = `{
  "cache": ["all"],
  "cacheTrailing": ["all", "best",],
  "globals": { delay: 123 },
  "globalsTrailing": { break: true, delay: 123, },
  "mainBroken":,
  "rootDir": "./path",
  "silent": false,
  "testFileMatch": ["**/packages/*/__typetests__/*.test.ts"],
  "veryLast": true
}
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-unknown-options`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("handles option values of wrong type", async () => {
    const config = {
      failFast: "always",
      target: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("handles indentation tabs", async () => {
    const configText = `{
\t"failFast": "always",
\t"target": true
}
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-handles-tabs`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("handles 'crlf' line endings", async () => {
    const configText = `{\r\n  "failFast": "always",\r\n  "target": true\r\n}\r\n`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-handles-crlf`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("handles syntax errors", async (t) => {
    await t.test("when root brace is missing", async () => {
      const config = [{ failFast: true }];

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-root-brace`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when option name is missing", async () => {
      const configText = `{
  : true,
  "testFileMatch": ["examples/*.tst.*"
`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-option-name`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when option values are unquoted", async () => {
      const configText = `{
    target: *,
    testFileMatch: [**/*.tst.*]
  }
  `;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-unquoted-values`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when closing brace is missing", async () => {
      const configText = `{
  'failFast': true
`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-closing-brace`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when opening bracket is missing", async () => {
      const configText = `{
  'failFast': true,
  "testFileMatch": { "glob": "examples/*.tst.*" }
}
`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-opening-bracket`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when closing bracket is missing", async () => {
      const configText = `{
  'failFast': true,
  "testFileMatch": ["examples/*.tst.*"
}
`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-closing-bracket`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when unexpected trailing token is encountered", async () => {
      const configText = `{
  'failFast': true,
}
unexpected
`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-unexpected-trailing-token`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });
  });
});

await test("'--config' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is missing", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--config"]);

    assert.equal(
      stderr,
      [
        "Error: Option '--config' expects a value.",
        "",
        "Value for the '--config' option must be a string.",
        "",
        "",
      ].join("\n"),
    );

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });
});
