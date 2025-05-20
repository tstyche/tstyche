import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

/**
 * @param {string} prolog
 */
function getTemplateTestText(prolog) {
  return `${prolog}

let testText = \`import { expect, test } from "tstyche";
\`;

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().type.toBe<\${target}>();
});
\`;
}

export default testText;
`;
}

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

await test("'// @tstyche template' directive", async (t) => {
  // TODO remove this check after dropping support for Node.js 20
  if (process.versions.node.startsWith("20")) {
    t.skip();

    return;
  }

  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/template.tst.ts"]: getTemplateTestText("// @tstyche template"),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when specified in kebab case", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/template.tst.ts"]: getTemplateTestText("//@tstyche-template"),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when preceded with a comment", async () => {
    const prolog = `/**
 * @file For documentation, see: https://tstyche.org/guide/template-test-files.
 */

//@tstyche template`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/template.tst.ts"]: getTemplateTestText(prolog),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when used together with '// @tstyche if <conditions>'", async () => {
    const prolog = `//@tstyche template
//@tstyche if { target: ["5.6"] }`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/template.tst.ts"]: getTemplateTestText(prolog),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"'], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-used-with-tstyche-if-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-used-with-tstyche-if-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when '// @tstyche if <conditions>' is specified in the test text", async () => {
    const templateTestText = `// @tstyche template

let testText = \`// @tstyche if { target: ["5.6"] }

import { expect, test } from "tstyche";
\`;

for (const target of ["string", "number"]) {
  testText += \`test("is \${target} a string?", () => {
  expect<string>().type.toBe<\${target}>();
});
\`;
}

export default testText;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: templateTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"'], {
      env: { ["NODE_OPTIONS"]: "--experimental-strip-types --no-warnings" },
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-test-text-with-tstyche-if-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-test-text-with-tstyche-if-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
