import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["**/*"],
};

const fixture = "config-only";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--only' command line option", () => {
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

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--only", "external"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
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

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--only", "external"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
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

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--only", "external"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when '--skip' command line option is specified", async () => {
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

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--only", "external", "--skip", "number"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified before the option", async () => {
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
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["dummy", "--only", "external"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified after the option", async () => {
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
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--only", "external", "dummy"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toBe("");

    expect(exitCode).toBe(0);
  });
});
