import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

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
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--only' command line option", function() {
  test("selects tests to run", async function() {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("selects test group to run", async function() {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-describe-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("does not override the '.skip' run mode flag", async function() {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-skip-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when '--skip' command line option is specified", async function() {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when search string is specified before the option", async function() {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when search string is specified after the option", async function() {
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
