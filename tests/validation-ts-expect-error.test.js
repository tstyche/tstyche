import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("single-line '@ts-expect-error' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when argument is missing", async () => {
    const testFileText = `// @ts-expect-error
const x: string = 0;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-single-line-missing-argument-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-missing-argument-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when multiple errors are suppressed", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'
console.log(add); console.log(add);

// @ts-expect-error: Cannot find name 'add'
console.log(add); console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised
console.log(add); console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-single-line-multiple-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-multiple-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});

await test("multi-line '@ts-expect-error' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when argument is missing", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error */
texts.push(100);

/**
// @ts-expect-error */
texts.push(100);

/**
 * @ts-expect-error */
texts.push(100);

/*@ts-expect-error*/
texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-multi-line-missing-argument-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-missing-argument-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when multiple errors are suppressed", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error  Argument of type 'number' is not assignable to parameter of type 'string'. */
texts.push(100); texts.push(100);

/**
// @ts-expect-error  Argument of type 'number' is not assignable to parameter of type 'string'. */
texts.push(100); texts.push(100);

/**
 * @ts-expect-error  Argument of type 'number' is not assignable to parameter of type 'string'. */
texts.push(100); texts.push(100);

/*@ts-expect-error  Argument of type 'number' is not assignable to parameter of type 'string'.*/
texts.push(100); texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-multi-line-multiple-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-multiple-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});

await test("jsx multi-line '@ts-expect-error' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when argument is missing", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error */}
  <ProfileCard userName={true} />

  {/*
    // @ts-expect-error */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error */}
  <ProfileCard userName={true} />

  {/*@ts-expect-error*/}
  <ProfileCard userName={true} />
</>
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-jsx-missing-argument-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-missing-argument-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when multiple errors are suppressed", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error  Type 'boolean' is not assignable to type 'string'. */}
  <ProfileCard userName={true} /><ProfileCard userName={true} />

  {/*
    // @ts-expect-error  Type 'boolean' is not assignable to type 'string'. */}
  <ProfileCard userName={true} /><ProfileCard userName={true} />

  {/*
    * @ts-expect-error  Type 'boolean' is not assignable to type 'string'. */}
  <ProfileCard userName={true} /><ProfileCard userName={true} />

  {/*@ts-expect-error  Type 'boolean' is not assignable to type 'string'.*/}
  <ProfileCard userName={true} /><ProfileCard userName={true} />
</>
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-jsx-multiple-errors-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multiple-errors-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
