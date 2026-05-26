import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toAcceptProps", async (t) => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-stderr`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);

  await t.test("requires the 'jsx' compiler option", async (t) => {
    const toAcceptPropsText = `import { expect } from "tstyche";

export default function Component() {
  return "Test";
}

expect(Component).type.toAcceptProps({});
`;

    const tsconfig = {
      extends: "../../../tsconfig.json",
      include: ["**/*"],
    };

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toAcceptProps.tst.tsx"]: toAcceptPropsText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-requires-jsx-option-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-requires-jsx-option-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("requires the 'tsx' file extension", async (t) => {
    const toAcceptPropsText = `import { expect } from "tstyche";

export default function Component() {
  return "Test";
}

expect(Component).type.toAcceptProps({});
`;

    const tsconfig = {
      extends: "../../../tsconfig.json",
      compilerOptions: {
        jsx: "react-jsx",
      },
      include: ["**/*"],
    };

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toAcceptProps.tst.ts"]: toAcceptPropsText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-requires-tsx-extension-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-requires-tsx-extension-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
