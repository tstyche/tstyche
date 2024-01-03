import { existsSync } from "node:fs";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
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

    test("handles 'current' target received from the configuration file", async () => {
      const config = { target: ["current"] };

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--install"], {
        ["TSTYCHE_STORE_PATH"]: "./.store",
      });

      expect(stdout).toBe("");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("handles 'current' target received from the command line", async () => {
      const config = { target: ["5.0", "latest"] };

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--install --target current"], {
        ["TSTYCHE_STORE_PATH"]: "./.store",
      });

      expect(stdout).toBe("");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });
  });

  describe("'--only' option", () => {
    test("selects tests to run", async () => {
      const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBeString();
});

test("external is number?", () => {
  expect<number>().type.toBeNumber();
});

test("internal is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--only external"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("selects test group to run", async () => {
      const testText = `import { describe, expect, test } from "tstyche";
describe("external", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });
});

test("external is number?", () => {
  expect<number>().type.toBeNumber();
});

test("internal is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--only external"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("does not override the '.skip' run mode flag", async () => {
      const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBeString();
});

test.skip("external is number?", () => {
  expect<number>().type.toBeNumber();
});

test("internal is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--only external"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("with '--skip' command line options", async () => {
      const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBeString();
});

test("external is number?", () => {
  expect<number>().type.toBeNumber();
});

test("internal is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--only external", "--skip number"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });
  });

  describe("'--prune' option", () => {
    test("removes store directory", async () => {
      const storeManifest = { $version: "0" };
      const storeUrl = new URL(".store/", getFixtureUrl(fixture));

      await writeFixture(fixture, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      expect(existsSync(storeUrl)).toBe(true);

      const { status, stderr, stdout } = spawnTyche(fixture, ["--prune"], { ["TSTYCHE_STORE_PATH"]: "./.store" });

      expect(existsSync(storeUrl)).toBe(false);

      expect(stdout).toBe("");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("does nothing, if directory does not exist", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--prune"], { ["TSTYCHE_STORE_PATH"]: "./.store" });

      expect(stdout).toBe("");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });
  });

  describe("'--skip' option", () => {
    test("selects tests to run", async () => {
      const testText = `import { expect, test } from "tstyche";
test("internal is string?", () => {
  expect<string>().type.toBeString();
});

test("internal is number?", () => {
  expect<number>().type.toBeNumber();
});

test("external is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--skip internal"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("selects test group to run", async () => {
      const testText = `import { describe, expect, test } from "tstyche";
describe("internal", () => {
  test("is string?", () => {
    expect<string>().type.toBeString();
  });
});

test("internal is number?", () => {
  expect<number>().type.toBeNumber();
});

test("external is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--skip internal"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("overrides the '.only' run mode flag", async () => {
      const testText = `import { expect, test } from "tstyche";
test.only("internal is string?", () => {
  expect<string>().type.toBeString();
});

test.only("internal is number?", () => {
  expect<number>().type.toBeNumber();
});

test.only("external is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--skip internal"]);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("with '--only' command line options", async () => {
      const testText = `import { expect, test } from "tstyche";
test("internal is string?", () => {
  expect<string>().type.toBeString();
});

test("internal is number?", () => {
  expect<number>().type.toBeNumber();
});

test.only("external is string?", () => {
  expect<string>().type.toBeString();
});
`;

      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: testText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--only number", "--skip internal"]);

      expect(stdout).toMatchSnapshot("stdout");
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

      const { status, stderr, stdout } = spawnTyche(fixture, ["--target 4.8"], { ["TSTYCHE_STORE_PATH"]: "./.store" });

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("handles multiple targets", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture, ["--target 4.8,5.3.2,current"], {
        ["TSTYCHE_STORE_PATH"]: "./.store",
      });

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });

    test("handles 'current' tag", async () => {
      await writeFixture(fixture, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });

      const { status, stderr } = spawnTyche(fixture, ["--target current"]);

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

  test("'--version' option", async () => {
    await writeFixture(fixture, {
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--version"]);

    expect(stdout).toMatch(/^\d+\.\d+\.\d+/);
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });
});
