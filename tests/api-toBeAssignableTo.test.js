import { test } from "mocha";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("'toBeAssignableTo' implementation", () => {
  tstyche.expect({ a: "sample" }).type.toBeAssignableTo({ a: "sample" });
  tstyche.expect({ a: "sample" }).type.not.toBeAssignableTo({ b: "sample" });
});

test("toBeAssignableTo", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
