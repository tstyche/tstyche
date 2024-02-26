import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
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

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--only", "external"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--only", "external"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-describe-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--only", "external"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-skip-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--only", "external", "--skip", "number"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["dummy", "--only", "external"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
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

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--only", "external", "dummy"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
