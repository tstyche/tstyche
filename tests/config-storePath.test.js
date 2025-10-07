import os from "node:os";
import process from "node:process";
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

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'TSTYCHE_STORE_PATH' environment variable", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("on Linux", async (t) => {
    if (process.platform !== "linux") {
      t.skip();

      return;
    }

    await t.test("has default value", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.equal(stderr, "");

      assert.matchObject(normalizeOutput(stdout), {
        storePath: `${os.homedir()}/.local/share/TSTyche`,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("when 'XDG_DATA_HOME' is specified", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["XDG_DATA_HOME"]: "/.sample-store",
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.equal(stderr, "");

      assert.matchObject(normalizeOutput(stdout), {
        storePath: "/.sample-store/TSTyche",
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("on macOS", async (t) => {
    if (process.platform !== "darwin") {
      t.skip();

      return;
    }

    await t.test("has default value", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.equal(stderr, "");

      assert.matchObject(normalizeOutput(stdout), {
        storePath: `${os.homedir()}/Library/TSTyche`,
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("on Windows", async (t) => {
    if (process.platform !== "win32") {
      t.skip();

      return;
    }

    await t.test("has default value", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.equal(stderr, "");

      assert.matchObject(normalizeOutput(stdout), {
        storePath: `${process.env["LocalAppData"]}\\TSTyche`.replace(/\\/g, "/"),
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("when specified, uses the path", async () => {
    const storeUrl = new URL("./dummy-store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(storeUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--fetch", "--target", "5.2.2"], {
      env: {
        ["TSTYCHE_STORE_PATH"]: "./dummy-store",
      },
    });

    assert.pathExists(storeUrl);

    assert.equal(stderr, "");

    assert.equal(
      normalizeOutput(stdout),
      "adds TypeScript 5.2.2 to <<basePath>>/tests/__fixtures__/.generated/config-storePath/dummy-store/typescript@5.2.2\n",
    );

    assert.equal(exitCode, 0);
  });
});
