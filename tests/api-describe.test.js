import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("describe", async (t) => {
  await t.test("includes nested", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["nested"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-nested-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("'describe' implementation'", () => {
    tstyche.describe("sample", () => {
      //
    });
  });

  await t.test("'describe.only' implementation'", () => {
    tstyche.describe.only("sample", () => {
      //
    });
  });

  await t.test("describe.only", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-only-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("'describe.skip' implementation'", () => {
    tstyche.describe.skip("sample", () => {
      //
    });
  });

  await t.test("describe.skip", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skip-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("'describe.todo' implementation'", () => {
    tstyche.describe.todo("sample");
    tstyche.describe.todo("sample", () => {
      //
    });
  });

  await t.test("describe.todo", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
