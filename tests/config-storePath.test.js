import os from "node:os";
import { afterEach, describe, test } from "poku";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await describe("'TSTYCHE_STORE_PATH' environment variable", async () => {
  if (process.versions.node.startsWith("16")) {
    // store is not supported on Node.js 16
    return;
  }

  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await describe("on Linux", async () => {
    if (process.platform !== "linux") {
      return;
    }

    await test("has default value", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.matchObject(normalizeOutput(stdout), {
        storePath: `${os.homedir()}/.local/share/TSTyche`,
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await test("when 'XDG_DATA_HOME' is specified", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["XDG_DATA_HOME"]: "/.sample-store",
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.matchObject(normalizeOutput(stdout), {
        storePath: "/.sample-store/TSTyche",
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });

  await describe("on macOS", async () => {
    if (process.platform !== "darwin") {
      return;
    }

    await test("has default value", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.matchObject(normalizeOutput(stdout), {
        storePath: `${os.homedir()}/Library/TSTyche`,
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });

  await describe("on Windows", async () => {
    if (process.platform !== "win32") {
      return;
    }

    await test("has default value", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"], {
        env: {
          ["TSTYCHE_STORE_PATH"]: undefined,
        },
      });

      assert.matchObject(normalizeOutput(stdout), {
        storePath: `${process.env["LocalAppData"]}\\TSTyche`.replace(/\\/g, "/"),
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });

  await test("when specified, uses the path", async () => {
    const storeUrl = new URL("./dummy-store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExist(storeUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"], {
      env: {
        ["TSTYCHE_STORE_PATH"]: "./dummy-store",
      },
    });

    assert.fileExists(storeUrl);

    assert.equal(
      normalizeOutput(stdout),
      "adds TypeScript 5.2.2 to <<cwd>>/tests/__fixtures__/.generated/config-storePath/dummy-store/typescript@5.2.2\n",
    );

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
