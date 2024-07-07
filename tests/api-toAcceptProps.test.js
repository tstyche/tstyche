import { describe, test } from "mocha";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

/**
 * @param {{ name: string; quantity: string }} props
 */
function Item(props) {
  return `${props.name}: ${props.quantity}`;
}

describe("toAcceptProps", function () {
  test("implementation", function () {
    tstyche.expect(Item).type.toAcceptProps({ name: "one", quantity: "2" });
    tstyche.expect(Item).type.not.toAcceptProps({});
  });

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

  test("class components", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["class-components"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-class-components-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-class-components-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("overloaded components", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["overloaded-components"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overloaded-components-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-overloaded-components-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("special cases", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["special-cases"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-special-cases-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-special-cases-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
