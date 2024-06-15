import os from "node:os";
import { afterEach, before, describe, test } from "mocha";
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

describe("'TSTYCHE_STORE_PATH' environment variable", function () {
  before(function () {
    if (process.versions.node.startsWith("16")) {
      // store is not supported on Node.js 16
      this.skip();
    }
  });

  afterEach(async function () {
    await clearFixture(fixtureUrl);
  });

  describe("on linux", function () {
    before(function () {
      if (process.platform !== "linux") {
        this.skip();
      }
    });

    test("has default value", async function () {
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

    test("when 'XDG_DATA_HOME' is specified", async function () {
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

  describe("on macOS", function () {
    before(function () {
      if (process.platform !== "darwin") {
        this.skip();
      }
    });

    test("has default value", async function () {
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

  describe("on Windows", function () {
    before(function () {
      if (process.platform !== "win32") {
        this.skip();
      }
    });

    test("has default value", async function () {
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

  test("when specified, uses the path", async function () {
    const storeUrl = new URL("./dummy-store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(storeUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"], {
      env: {
        ["TSTYCHE_STORE_PATH"]: "./dummy-store",
      },
    });

    assert.fileExists(storeUrl);

    assert.equal(
      normalizeOutput(stdout),
      "adds TypeScript 5.2.2 to <<cwd>>/tests/__fixtures__/.generated/config-storePath/dummy-store/5.2.2\n",
    );

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
