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

const fixture = "command-line-options";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("command line options", () => {
  describe("'--install' option", () => {
    test("default", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--install"], { ["TSTYCHE_STORE_PATH"]: "./.store" });

      expect(stdout).toMatch(
        /^adds TypeScript \d\.\d\.\d to <<cwd>>\/tests\/__fixtures__\/command-line-options\/\.store\/\d\.\d\.\d/,
      );
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("with 'target' configuration option", async () => {
      const config = { target: ["4.8", "5.0"] };

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--install"], { ["TSTYCHE_STORE_PATH"]: "./.store" });

      expect(stdout).toMatchInlineSnapshot(`
        "adds TypeScript 4.8.4 to <<cwd>>/tests/__fixtures__/command-line-options/.store/4.8.4
        adds TypeScript 5.0.4 to <<cwd>>/tests/__fixtures__/command-line-options/.store/5.0.4
        "
      `);
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("with '--target' command line options", async () => {
      const config = { target: ["5.0", "latest"] };

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--install --target 4.9"], {
        ["TSTYCHE_STORE_PATH"]: "./.store",
      });

      expect(stdout).toMatchInlineSnapshot(`
        "adds TypeScript 4.9.5 to <<cwd>>/tests/__fixtures__/command-line-options/.store/4.9.5
        "
      `);
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });
  });

  describe("'--target' option", () => {
    test("handles single target", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--target 4.8"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("handles multiple targets", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--target 4.8,latest"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("handles 'current' tag", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--target current"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("handles not supported '--target' option value", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--target new"]);

      expect(stdout).toBe("");
      expect(stderr).toMatch(
        [
          "Error: TypeScript version 'new' is not supported.",
          "",
          "Argument for the '--target' option must be a single tag or a comma separated list.",
          "Usage examples:",
        ].join("\r\n"),
      );

      expect(status).toBe(1);
    });
  });
});
