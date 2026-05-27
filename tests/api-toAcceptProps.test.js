import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toAcceptProps", async (t) => {
  await t.test("'toAcceptProps' implementation", () => {
    tstyche.expect().type.toAcceptProps({});
    tstyche.expect().type.not.toAcceptProps({});
  });

  await t.test("function components", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["function-components"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-function-components-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-function-components-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("class components", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["class-components"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-class-components-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-class-components-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("overloaded components", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["overloaded-components"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-overloaded-components-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overloaded-components-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("generic components", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["generic-components"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-generic-components-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-generic-components-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("special cases", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["special-cases"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-special-cases-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-special-cases-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles missing semicolons", async (t) => {
    const toAcceptPropsText = `import { expect, test } from "tstyche"

interface ButtonProps {
  text: string
  type?: "reset" | "submit"
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>
}

test("accepts props?", () => {
  expect(Button).type.toAcceptProps({ text: "Send" })
  expect(Button).type.toAcceptProps({ text: "Clear", type: "reset" as const })

  expect(Button).type.not.toAcceptProps({ text: "Download", type: "button" as const })
  expect(Button).type.not.toAcceptProps({})
})
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
      ["__typetests__/toAcceptProps.tst.tsx"]: toAcceptPropsText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-missing-semicolons-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("handles trailing comma", async (t) => {
    const toAcceptPropsText = `import { expect, test } from "tstyche";

interface ButtonProps {
  text: string;
  type?: "reset" | "submit";
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>;
}

test("accepts props?", () => {
  expect(
    Button,
  ).type.not.toAcceptProps({ text: "Send" }); // fail
  expect(Button,  \n  ).type.not.toAcceptProps({ text: "Clear", type: "reset" as const }); // fail

  expect(
    Button  ,
  ).type.toAcceptProps({}); // fail
});
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
      ["__typetests__/toAcceptPropsText.tst.tsx"]: toAcceptPropsText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-trailing-comma-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-trailing-comma-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles brackets", async (t) => {
    const toAcceptPropsText = `import { expect, test } from "tstyche";

interface ButtonProps {
  text: string;
  type?: "reset" | "submit";
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>;
}

interface SecondProps {
  one: string | undefined;
  two?: boolean;
}

type Second = (props: SecondProps) => React.ReactElement;

test("accepts props?", () => {
  [expect(Button).type.toAcceptProps({ text: "Send" })];
  [expect(Button).type.not.toAcceptProps({ text: "Send" })]; // fail

  [expect<Second>().type.toAcceptProps({ one: "sample" })];
  [expect<Second>().type.not.toAcceptProps({ one: "sample" })]; // fail
});
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
      ["__typetests__/toAcceptProps.tst.tsx"]: toAcceptPropsText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-parentheses-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-parentheses-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
