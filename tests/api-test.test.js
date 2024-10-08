import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("test", async (t) => {
  await t.test("'test' implementation", () => {
    tstyche.test("sample", () => {
      //
    });
  });

  await t.test("'test.only' implementation", () => {
    tstyche.test.only("sample", () => {
      //
    });
  });

  await t.test("test.only", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-only-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("'test.skip' implementation", () => {
    tstyche.test.skip("sample", () => {
      //
    });
  });

  await t.test("test.skip", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skip-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("'test.todo' implementation", () => {
    tstyche.test.todo("sample");
    tstyche.test.todo("sample", () => {
      //
    });
  });

  await t.test("test.todo", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
