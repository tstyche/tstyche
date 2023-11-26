import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBeNumber();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["./"],
};

const fixture = "config-file-options";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("tstyche.config.json", () => {
  describe("'allowNoTestFiles: false' option", () => {
    test("errors when no test files are selected", async () => {
      const config = { allowNoTestFiles: false };

      await writeFixture(fixture, {
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture);

      expect(stdout).toBe("");
      expect(stderr).toMatchSnapshot("stderr");

      expect(status).toBe(1);
    });
  });

  describe("'allowNoTestFiles: true' option", () => {
    test("warns when no test files are selected", async () => {
      const config = { allowNoTestFiles: true };

      await writeFixture(fixture, {
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { status, stderr, stdout } = spawnTyche(fixture);

      expect(stdout).toMatchSnapshot("stdout");
      expect(stderr).toBe("");

      expect(status).toBe(0);
    });
  });

  test("'rootPath' option", async () => {
    const config = {
      rootPath: "../",
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--config ./config/tstyche.json", "--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      config: expect.stringMatching(/config-file-options\/config\/tstyche.json$/),
      rootPath: expect.stringMatching(/config-file-options$/),
    });
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });

  test("handles not existing 'rootPath' option path", async () => {
    const config = {
      rootPath: "../nope",
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--config ./config/tstyche.json"]);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot();

    expect(status).toBe(1);
  });

  test("'target' option", async () => {
    const config = {
      target: ["4.8", "latest"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });

  test("handles 'current' as 'target' option value", async () => {
    const config = {
      target: ["current"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr } = spawnTyche(fixture);

    expect(stderr).toBe("");

    expect(status).toBe(0);
  });

  test("handles not supported 'target' option value", async () => {
    const config = {
      target: ["new"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: TypeScript version 'new' is not supported.",
        "",
        "Item of the 'target' list must be a supported version tag.",
        "Supported tags:",
      ].join("\r\n"),
    );

    expect(status).toBe(1);
  });

  test("'testFileMatch' option", async () => {
    const config = {
      testFileMatch: ["**/type-tests/*.test.ts"],
    };

    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      ["type-tests/isNumber.test.ts"]: isNumberTestText,
      ["type-tests/isString.test.ts"]: isStringTestText,
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });

  test("handles unknown options", async () => {
    const config = {
      cache: "all",
      silent: true,
      testFileMatch: ["**/packages/*/__typetests__/*.test.ts"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles option argument of wrong type", async () => {
    const config = {
      failFast: "always",
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles list item of wrong type", async () => {
    const config = {
      testFileMatch: [true],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles wrong root value", async () => {
    const config = [{ setupTimeout: 30 }];

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles single quoted property names", async () => {
    const configText = `{
  'failFast': true
}`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: configText,
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles single quoted values", async () => {
    const configText = `{
  "rootPath": '../'
}`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: configText,
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles single quoted list items", async () => {
    const configText = `{
  "target": ['4.8']
}`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: configText,
    });

    const { status, stderr, stdout } = spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("handles comments", async () => {
    const configText = `{
  /* test */
  "failFast": true,
  /* test */ "target": ["rc"],
  // test
  "testFileMatch": /* test */ [
    "examples/**/*.test.ts" /* test */,
    /* test */ "**/__typetests__/*.test.ts"
  ]
}
`;

    await writeFixture(fixture, {
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: configText,
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      failFast: true,
      target: ["rc"],
      testFileMatch: ["examples/**/*.test.ts", "**/__typetests__/*.test.ts"],
    });
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });
});
