import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
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

const fixture = "feature-runner";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("search strings", () => {
  test("when single search string is provided, selects matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["number"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when multiple search strings are provided, selects matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["string", "feature"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when relative search string is provided, selects matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["./feature/__tests__/isNumber"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("only the files matched by the 'testFileMatch' patterns are selected", async () => {
    const config = {
      testFileMatch: ["**/feature/__tests__/**.*"],
    };
    const tsconfig = { extends: "../../../tsconfig.json", include: ["**/*"] };

    await writeFixture(fixture, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["feature/__tests__/__snapshot__/isNumber.test.ts.snap"]: "isNumberSnap",
      ["feature/__tests__/__snapshot__/isString.test.ts.snap"]: "isStringSnap",
      ["feature/__tests__/isNumber.test.ts"]: isNumberTestText,
      ["feature/__tests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["number"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});

describe("test files", () => {
  test("allows a file to be empty", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: "",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only an empty describe", async () => {
    const testText = `import { describe } from "tstyche";
describe("parent", () => {
  describe("empty describe", function () {
    // no test
  });
});
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only skipped describe", async () => {
    const testText = `import { describe } from "tstyche";
describe.skip("skipped describe", function () {
  test("is skipped?", () => {
    expect<void>().type.toBeVoid();
  });
});
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only todo describe", async () => {
    const testText = `import { describe } from "tstyche";
describe.todo("have todo this", () => {});
describe.todo("and this one");
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only empty tests", async () => {
    const testText = `import { describe, test } from "tstyche";
test("empty test", () => {
  // no assertion
});
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only skipped tests", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
test.skip("is skipped?", () => {
  expect<void>().type.toBeVoid();
});
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only todo tests", async () => {
    const testText = `import { describe, test } from "tstyche";
test.todo("have todo this", () => {});
test.todo("and this one");
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("allows a file to have only expect", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
expect<number>().type.toBeNumber();
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});

describe("compiler options", () => {
  test("when TSConfig file is missing, sets default compiler options", async () => {
    const testText = `import { expect, test } from "tstyche";

test("'strictNullChecks': true", () => {
  function x(a?: string) {
    return a;
  }

  expect(x()).type.not.toEqual<string>();
});

test("'strictFunctionTypes': true", () => {
  function y(a: string) {
    return a;
  }

  expect<(a: string | number) => void>().type.not.toBeAssignable(y);
});

test("'useUnknownInCatchVariables': false", () => {
  try {
    //
  } catch (error) {
    expect(error).type.toBeAny();
  }
});
`;

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
