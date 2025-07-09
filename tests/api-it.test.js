import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("it", async (t) => {
  await t.test("'it' implementation", () => {
    tstyche.it("sample", () => {
      //
    });
  });

  await t.test("'it.only' implementation", () => {
    tstyche.it.only("sample", () => {
      //
    });
  });

  await t.test("it.only", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-only-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("'it.skip' implementation", () => {
    tstyche.it.skip("sample", () => {
      //
    });
  });

  await t.test("it.skip", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skip-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("'it.todo' implementation", () => {
    tstyche.it.todo("sample");
    tstyche.it.todo("sample", () => {
      //
    });
  });

  await t.test("it.todo", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-todo-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
