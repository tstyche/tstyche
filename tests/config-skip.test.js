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

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--skip' command line option", function() {
  test("selects tests to run", async function() {
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

    const args = ["--skip", "internal"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("selects test group to run", async function() {
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

    const args = ["--skip", "internal"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-describe-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("overrides the '.only' run mode flag", async function() {
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

    const args = ["--skip", "internal"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-only-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when '--only' command line option is specified", async function() {
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

    const args = ["--only", "number", "--skip", "internal"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when search string is specified before the option", async function() {
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

    const args = ["dummy", "--skip", "internal"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when search string is specified after the option", async function() {
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

    const args = ["--skip", "internal", "dummy"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
