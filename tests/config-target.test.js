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

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--target' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when single target is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--target", "5.2"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when multiple targets are specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--target", "5.3.2,5.8"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when version range is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">5.1"', "--showConfig"]);

    assert.equal(stderr, "");
    assert.match(stdout, /"target": \[\n {4}"5\.2",\n {4}"5\.3",\n {4}"5\.4",\n {4}"5\.5"/);
    assert.equal(exitCode, 0);
  });

  await t.test("when version range with an upper bound is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.3 <5.5"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-upper-bound-version-range-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when range with not supported version is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.4 <8.2"', "--showConfig"]);

    assert.equal(stderr, "");
    assert.match(stdout, /"target": \[\n {4}"5\.4",\n {4}"5\.5",\n {4}"5\.6",\n {4}"5\.7"/);
    assert.equal(exitCode, 0);
  });

  await t.test("when combination of ranges and versions is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const args = ["--target", '">=5.2 <=5.3, 5.4.2, >5.5"', "--showConfig"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    assert.equal(stderr, "");
    assert.match(stdout, /"target": \[\n {4}"5\.2",\n {4}"5\.3",\n {4}"5\.4\.2",\n {4}"5\.6"/);
    assert.equal(exitCode, 0);
  });

  await t.test("when '*' is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '"*"']);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-target-asterisk-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when '*' is specified, but TypeScript is not installed", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '"*"'], {
      env: { ["TSTYCHE_TYPESCRIPT_MODULE"]: "" },
    });

    assert.equal(stderr, "");
    assert.match(stdout, /^adds TypeScript/);

    assert.equal(exitCode, 0);
  });

  await t.test("when 'target' configuration file option is specified", async () => {
    const config = {
      target: [">=5.4"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overrides-target-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["isNumber", "--target", "5.8"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--target", "5.6", "isString"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});

await test("'target' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when single target is specified", async () => {
    const config = {
      target: ["5.4"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-target-5.4-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when multiple targets are specified", async () => {
    const config = {
      target: ["5.3.2", "5.8"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-target-5.3.2-5.8-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when version range is specified", async () => {
    const config = {
      target: [">5.1"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");
    assert.match(stdout, /"target": \[\n {4}"5\.2",\n {4}"5\.3",\n {4}"5\.4",\n {4}"5\.5"/);
    assert.equal(exitCode, 0);
  });

  await t.test("when version range with an upper bound is specified", async () => {
    const config = {
      target: [">=5.3 <5.5"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-upper-bound-version-range-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when range with not supported version is specified", async () => {
    const config = {
      target: [">=5.4 <8.2"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");
    assert.match(stdout, /"target": \[\n {4}"5\.4",\n {4}"5\.5",\n {4}"5\.6",\n {4}"5\.7"/);
    assert.equal(exitCode, 0);
  });

  await t.test("when combination of ranges and versions is specified", async () => {
    const config = {
      target: [">=5.2 <=5.3", "5.4.2", ">5.5"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");
    assert.match(stdout, /"target": \[\n {4}"5\.2",\n {4}"5\.3",\n {4}"5\.4\.2",\n {4}"5\.6"/);
    assert.equal(exitCode, 0);
  });

  await t.test("when '*' is specified", async () => {
    const config = {
      target: ["*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-target-asterisk-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when '*' is specified, but TypeScript is not installed", async () => {
    const config = {
      target: ["*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_TYPESCRIPT_MODULE"]: "" },
    });

    assert.equal(stderr, "");
    assert.match(stdout, /^adds TypeScript/);

    assert.equal(exitCode, 0);
  });
});
