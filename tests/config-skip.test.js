import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const fixtureUrl = getFixtureUrl("config-skip", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--skip' command line option", () => {
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip", "internal"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip", "internal"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip", "internal"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when '--only' command line option is specified", async () => {
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--only", "number", "--skip", "internal"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified before the option", async () => {
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["dummy", "--skip", "internal"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified after the option", async () => {
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip", "internal", "dummy"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toBe("");

    expect(exitCode).toBe(0);
  });
});
