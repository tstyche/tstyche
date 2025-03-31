import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--only' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("selects tests to run", async () => {
    const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBe<string>();
});

test("external is number?", () => {
  expect<number>().type.toBe<number>();
});

test("internal is string?", () => {
  expect<string>().type.toBe<string>();
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

  await t.test("selects test group to run", async () => {
    const testText = `import { describe, expect, test } from "tstyche";
describe("external", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
});

test("external is number?", () => {
  expect<number>().type.toBe<number>();
});

test("internal is string?", () => {
  expect<string>().type.toBe<string>();
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

  await t.test("does not override the '.skip' run mode flag", async () => {
    const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBe<string>();
});

test.skip("external is number?", () => {
  expect<number>().type.toBe<number>();
});

test("internal is string?", () => {
  expect<string>().type.toBe<string>();
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

  await t.test("when '--skip' command line option is specified", async () => {
    const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBe<string>();
});

test("external is number?", () => {
  expect<number>().type.toBe<number>();
});

test("internal is string?", () => {
  expect<string>().type.toBe<string>();
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

  await t.test("when search string is specified before the option", async () => {
    const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBe<string>();
});

test("external is number?", () => {
  expect<number>().type.toBe<number>();
});

test("internal is string?", () => {
  expect<string>().type.toBe<string>();
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

  await t.test("when search string is specified after the option", async () => {
    const testText = `import { expect, test } from "tstyche";
test("external is string?", () => {
  expect<string>().type.toBe<string>();
});

test("external is number?", () => {
  expect<number>().type.toBe<number>();
});

test("internal is string?", () => {
  expect<string>().type.toBe<string>();
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
