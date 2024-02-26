import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("test files", () => {
  test("allows a file to be empty", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: "",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-empty-file`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only an empty describe", async () => {
    const testText = `import { describe } from "tstyche";
describe("parent", () => {
  describe("empty describe", function () {
    // no test
  });
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-empty-describe`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only skipped describe", async () => {
    const testText = `import { describe } from "tstyche";
describe.skip("skipped describe", function () {
  test("is skipped?", () => {
    expect<void>().type.toBeVoid();
  });
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skipped-describe`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only todo describe", async () => {
    const testText = `import { describe } from "tstyche";
describe.todo("have todo this", () => {});
describe.todo("and this one");
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-describe`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only empty test", async () => {
    const testText = `import { describe, test } from "tstyche";
test("empty test", () => {
  // no assertion
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-empty-test`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only skipped test", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
test.skip("is skipped?", () => {
  expect<void>().type.toBeVoid();
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skipped-test`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only todo test", async () => {
    const testText = `import { describe, test } from "tstyche";
test.todo("have todo this", () => {});
test.todo("and this one");
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-test`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("allows a file to have only expect", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
expect<number>().type.toBeNumber();
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-only-expect`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-sets-default-compiler-options`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
