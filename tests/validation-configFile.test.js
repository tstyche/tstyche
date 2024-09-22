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
    const config = {
      cache: "all",
      silent: true,
      testFileMatch: ["**/packages/*/__typetests__/*.test.ts"],
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-unknown-options-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles option values of wrong type", async () => {
    const config = {
      failFast: "always",
      rootPath: true,
    };

    await writeFixture(fixtureUrl, {
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

  await t.test("when tabs are used for indentation, handles option values of wrong type", async () => {
    const configText = `{
\t"failFast": "always",
\t"rootPath": true
}
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-tabs-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles wrong root value", async () => {
    const config = [{ failFast: true }];

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-root-value`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles syntax errors", async (t) => {
    await t.test("when closing brace is missing", async () => {
      const configText = `{
  'failFast': true
`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stdout, "");

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-closing-brace`,
        testFileUrl: import.meta.url,
      });

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

      assert.equal(stdout, "");

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-syntax-errors-closing-bracket`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 1);
    });
  });

  await t.test("handles single quotes", async (t) => {
    await t.test("when encountered in option names", async () => {
      const configText = `{
  'failFast': true,
  "target": ["current"]
}`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stdout, "");

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-single-quoted-option-names`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 1);
    });

    await t.test("when encountered in option values", async () => {
      const configText = `{
  "rootPath": '../',
  "target": ["current"]
}`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stdout, "");

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-single-quoted-option-values`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 1);
    });

    await t.test("when encountered in list values", async () => {
      const configText = `{
  "target": ['4.8', "5.2"]
}`;

      await writeFixture(fixtureUrl, {
        ["tstyche.config.json"]: configText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stdout, "");

      await assert.matchSnapshot(stderr, {
        fileName: `${testFileName}-single-quoted-list-values`,
        testFileUrl: import.meta.url,
      });

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

    assert.equal(stdout, "");

    assert.equal(
      stderr,
      [
        "Error: Option '--config' expects a value.",
        "",
        "Option '--config' requires a value of type string.",
        "",
        "",
      ].join("\n"),
    );

    assert.equal(exitCode, 1);
  });
});
