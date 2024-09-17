import { test } from "node:test";
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

await test("toAcceptProps", async (t) => {
  t.test("implementation", () => {
    tstyche.expect(Item).type.toAcceptProps({ name: "one", quantity: "2" });
    tstyche.expect(Item).type.not.toAcceptProps({});
  });

  await t.test("function components", async () => {
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

  await t.test("class components", async () => {
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

  await t.test("overloaded components", async () => {
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

  await t.test("special cases", async () => {
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
