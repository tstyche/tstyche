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

  await t.test("when message matches", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'
console.log(add);

// @ts-expect-error: Cannot find name 'add'
console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised
console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-matches-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when message does not match", async () => {
    const testFileText = `// @ts-expect-error Does not work
console.log(add);

// @ts-expect-error: Does not work
console.log(add);

// @ts-expect-error Does not work -- Only one error raised
console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-single-line-does-not-match-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-does-not-match-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("with blank lines", async () => {
    const testFileText = `// @ts-expect-error Cannot find name 'add'

console.log(add);

// @ts-expect-error: Cannot find name 'add'

console.log(add);

// @ts-expect-error Cannot find name 'add' -- Only one error raised

console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-blank-line-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("with indents", async () => {
    const testFileText = `  // @ts-expect-error Does not work
  console.log(add);

  // @ts-expect-error: Does not work
  console.log(add);

  // @ts-expect-error Does not work -- Should handle indentation
  console.log(add);

\t// @ts-expect-error Does not work
\tconsole.log(add);

\t// @ts-expect-error: Does not work
\tconsole.log(add);

\t// @ts-expect-error Does not work -- Should handle indentation
\tconsole.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-single-line-indents-stderr`,
      testFileUrl: import.meta.url,
    });
    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-indents-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when message is truncated", async () => {
    const testFileText = `let a: Promise<string>;

// @ts-expect-error Type 'number' is not assignable to type 'Promise<string>'.
a = 123;
// @ts-expect-error Type 'boolean' is not assignable to type 'Promise<...>' -- Allows messages to be truncated
a = true;
// @ts-expect-error Type '...' is not assignable to type 'Promise<string>'
a = true;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-truncated-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when check is disabled", async () => {
    const testFileText = `// @ts-expect-error!
console.log(add);

// @ts-expect-error! Does not work
console.log(add);

// @ts-expect-error! Does not work
console.log(add);

// @ts-expect-error! Does not work -- Only one error raised
console.log(add);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-line-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});

await test("multi-line '@ts-expect-error' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when message matches", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' */
texts.push(100);

/**
@ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string' */
texts.push(100);

/**
@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised */
texts.push(100);

/**
// @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' */
texts.push(100);

/**
// @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string' */
texts.push(100);

/**
// @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised */
texts.push(100);

/**
 * @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' */
texts.push(100);

/**
 * @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string' */
texts.push(100);

/**
 * @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised  */
texts.push(100);

/*@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'*/
texts.push(100);

/*@ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string'*/
texts.push(100);

/*@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised */
texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-matches-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when message does not match", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error Does not work */
texts.push(100);

/**
@ts-expect-error: Does not work */
texts.push(100);

/**
@ts-expect-error Does not work -- Only one error raised */
texts.push(100);

/**
// @ts-expect-error Does not work */
texts.push(100);

/**
// @ts-expect-error: Does not work */
texts.push(100);

/**
// @ts-expect-error Does not work -- Only one error raised */
texts.push(100);

/**
 * @ts-expect-error Does not work */
texts.push(100);

/**
 * @ts-expect-error: Does not work */
texts.push(100);

/**
 * @ts-expect-error Does not work -- Only one error raised  */
texts.push(100);

/*@ts-expect-error Does not work*/
texts.push(100);

/*@ts-expect-error: Does not work*/
texts.push(100);

/*@ts-expect-error Does not work -- Only one error raised */
texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-multi-line-does-not-match-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-does-not-match-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("with blank lines", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' */

texts.push(100);

/**
@ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string' */

texts.push(100);

/**
@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised */

texts.push(100);

/**
// @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' */

texts.push(100);

/**
// @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string' */

texts.push(100);

/**
// @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised */

texts.push(100);

/**
 * @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' */

texts.push(100);

/**
 * @ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string' */

texts.push(100);

/**
 * @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised  */

texts.push(100);

/*@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'*/

texts.push(100);

/*@ts-expect-error: Argument of type 'number' is not assignable to parameter of type 'string'*/

texts.push(100);

/*@ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string' -- Only one error raised */

texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-blank-line-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("with indents", async () => {
    const testFileText = `const texts: Array<string> = [];

  /**
  @ts-expect-error Does not work */
  texts.push(100);

  /**
  @ts-expect-error: Does not work */
  texts.push(100);

  /**
  @ts-expect-error Does not work -- Should handle indentation */
  texts.push(100);

\t/**
\t@ts-expect-error Does not work */
\ttexts.push(100);

\t/**
\t@ts-expect-error: Does not work */
\ttexts.push(100);

\t/**
\t@ts-expect-error Does not work -- Should handle indentation */
\ttexts.push(100);

  /**
  // @ts-expect-error Does not work */
  texts.push(100);

  /**
  // @ts-expect-error: Does not work */
  texts.push(100);

  /**
  // @ts-expect-error Does not work -- Should handle indentation */
  texts.push(100);

\t/**
\t// @ts-expect-error Does not work */
\ttexts.push(100);

\t/**
\t// @ts-expect-error: Does not work */
\ttexts.push(100);

\t/**
\t// @ts-expect-error Does not work -- Should handle indentation */
\ttexts.push(100);

  /**
   * @ts-expect-error Does not work */
  texts.push(100);

  /**
   * @ts-expect-error: Does not work */
  texts.push(100);

  /**
   * @ts-expect-error Does not work -- Should handle indentation  */
  texts.push(100);

\t/**
\t * @ts-expect-error Does not work */
\ttexts.push(100);

\t/**
\t * @ts-expect-error: Does not work */
\ttexts.push(100);

\t/**
\t * @ts-expect-error Does not work -- Should handle indentation  */
\ttexts.push(100);

  /*@ts-expect-error Does not work*/
  texts.push(100);

  /*@ts-expect-error: Does not work*/
  texts.push(100);

  /*@ts-expect-error Does not work -- Should handle indentation */
  texts.push(100);

\t/*@ts-expect-error Does not work*/
\ttexts.push(100);

\t/*@ts-expect-error: Does not work*/
\ttexts.push(100);

\t/*@ts-expect-error Does not work -- Should handle indentation */
\ttexts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-multi-line-indents-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-indents-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when message is truncated", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error Argument of type '...' is not assignable to parameter of type 'string' */
texts.push(100);

/**
@ts-expect-error Argument of type 'number' is not assignable to parameter of type '...' */
texts.push(100);

/**
// @ts-expect-error Argument of type '...' is not assignable to parameter of type 'string' */
texts.push(100);

/**
// @ts-expect-error: Argument of type 'number' is not assignable to parameter of type '...' */
texts.push(100);

/**
 * @ts-expect-error Argument of type '...' is not assignable to parameter of type 'string' */
texts.push(100);

/**
 * @ts-expect-error: Argument of type 'number' is not assignable to parameter of type '...' */
texts.push(100);

/*@ts-expect-error Argument of type '...' is not assignable to parameter of type 'string'*/
texts.push(100);

/*@ts-expect-error: Argument of type 'number' is not assignable to parameter of type '...'*/
texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-truncated-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when check is disabled", async () => {
    const testFileText = `const texts: Array<string> = [];

/**
@ts-expect-error! */
texts.push(100);

/**
@ts-expect-error! Does not work */
texts.push(100);

/**
@ts-expect-error! Does not work -- Only one error raised */
texts.push(100);

/**
// @ts-expect-error! Does not work */
texts.push(100);

/**
// @ts-expect-error! Does not work */
texts.push(100);

/**
// @ts-expect-error! Does not work -- Only one error raised */
texts.push(100);

/**
 * @ts-expect-error! Does not work */
texts.push(100);

/**
 * @ts-expect-error! Does not work */
texts.push(100);

/**
 * @ts-expect-error! Does not work -- Only one error raised  */
texts.push(100);

/*@ts-expect-error! Does not work*/
texts.push(100);

/*@ts-expect-error! Does not work*/
texts.push(100);

/*@ts-expect-error! Does not work -- Only one error raised */
texts.push(100);
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.ts"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multi-line-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});

await test("jsx multi-line '@ts-expect-error' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when message matches", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error Type 'boolean' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error: Type 'boolean' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Type 'boolean' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error: Type 'boolean' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Type 'boolean' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error: Type 'boolean' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*@ts-expect-error Type 'boolean' is not assignable to type 'string'*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error: Type 'boolean' is not assignable to type 'string'*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised*/}
  <ProfileCard userName={true} />
</>;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multi-line-matches-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when message does not match", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error Does not work */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error: Does not work */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error Does not work -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Does not work */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error: Does not work */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Does not work -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Does not work */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error: Does not work */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Does not work -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*@ts-expect-error Does not work*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error: Does not work*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error Does not work -- Only one error raised*/}
  <ProfileCard userName={true} />
</>;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-jsx-multi-line-does-not-match-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multi-line-does-not-match-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("with blank lines", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error Type 'boolean' is not assignable to type 'string' */}

  <ProfileCard userName={true} />

  {/*
      @ts-expect-error: Type 'boolean' is not assignable to type 'string' */}

  <ProfileCard userName={true} />

  {/*
      @ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised */}

  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Type 'boolean' is not assignable to type 'string' */}

  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error: Type 'boolean' is not assignable to type 'string' */}

  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised */}

  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Type 'boolean' is not assignable to type 'string' */}

  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error: Type 'boolean' is not assignable to type 'string' */}

  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised */}

  <ProfileCard userName={true} />

  {/*@ts-expect-error Type 'boolean' is not assignable to type 'string'*/}

  <ProfileCard userName={true} />

  {/*@ts-expect-error: Type 'boolean' is not assignable to type 'string'*/}

  <ProfileCard userName={true} />

  {/*@ts-expect-error Type 'boolean' is not assignable to type 'string' -- Only one error raised*/}

  <ProfileCard userName={true} />
</>;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multi-line-blank-line-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("with indents", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
\t{/*
\t\t\t@ts-expect-error Does not work */}
\t<ProfileCard userName={true} />

\t{/*
\t\t\t@ts-expect-error: Does not work */}
\t<ProfileCard userName={true} />

\t{/*
\t\t\t@ts-expect-error Does not work -- Only one error raised */}
\t<ProfileCard userName={true} />

\t{/*
\t\t\t// @ts-expect-error Does not work */}
\t<ProfileCard userName={true} />

\t{/*
\t\t\t// @ts-expect-error: Does not work */}
\t<ProfileCard userName={true} />

\t{/*
\t\t\t// @ts-expect-error Does not work -- Only one error raised */}
\t<ProfileCard userName={true} />

\t{/*
\t\t* @ts-expect-error Does not work */}
\t<ProfileCard userName={true} />

\t{/*
\t\t* @ts-expect-error: Does not work */}
\t<ProfileCard userName={true} />

\t{/*
\t\t* @ts-expect-error Does not work -- Only one error raised */}
\t<ProfileCard userName={true} />

\t{/*@ts-expect-error Does not work*/}
\t<ProfileCard userName={true} />

\t{/*@ts-expect-error: Does not work*/}
\t<ProfileCard userName={true} />

\t{/*@ts-expect-error Does not work -- Only one error raised*/}
\t<ProfileCard userName={true} />
</>;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-jsx-multi-line-indents-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multi-line-indents-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when message is truncated", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error Type '...' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error Type 'boolean' is not assignable to type '...' */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error Type '...' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error: Type 'boolean' is not assignable to type '...' */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error Type '...' is not assignable to type 'string' */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error: Type 'boolean' is not assignable to type '...' */}
  <ProfileCard userName={true} />

  {/*@ts-expect-error Type '...' is not assignable to type 'string'*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error: Type 'boolean' is not assignable to type '...'*/}
  <ProfileCard userName={true} />
</>;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multi-line-truncated-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when check is disabled", async () => {
    const testFileText = `function ProfileCard(props: { userName: string }) {
  return <>{props.userName}</>;
}

<>
  {/*
      @ts-expect-error! */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error! Does not work */}
  <ProfileCard userName={true} />

  {/*
      @ts-expect-error! Does not work -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error! */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error! Does not work */}
  <ProfileCard userName={true} />

  {/*
      // @ts-expect-error! Does not work -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error! */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error! Does not work */}
  <ProfileCard userName={true} />

  {/*
    * @ts-expect-error! Does not work -- Only one error raised */}
  <ProfileCard userName={true} />

  {/*@ts-expect-error!*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error! Does not work*/}
  <ProfileCard userName={true} />

  {/*@ts-expect-error! Does not work -- Only one error raised*/}
  <ProfileCard userName={true} />
</>;
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/sample.tst.tsx"]: testFileText,
      ["tstyche.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-jsx-multi-line-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
