import { describe, test } from "mocha";
// import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

describe("toAcceptProps", function () {
  // test("implementation", function () {
  //   tstyche.expect(() => null).type.toAcceptProps();
  //   tstyche.expect(() => null).type.not.toAcceptProps("two");
  // });

  test("function components", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["function-components"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-function-components-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-function-components-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
