import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const indexText = `/**
 * Creates a status badge.
 *
 * @param {object} format - Badge properties
 * @param {string} format.message - The message displayed on the badge (e.g., 'pass')
 * @param {string=} format.color - (Optional) The color of the message
 */
export function createBadge(format) {
  // ...
}
`;

const testText = `import { createBadge } from "badge";

createBadge({ message: "pass" });
createBadge({ message: "fail", color: "red" });

// @ts-expect-error  Expected 1 arguments, but got 0.
createBadge();
// @ts-expect-error  Property 'message' is missing in type '{}'
createBadge({});
// @ts-expect-error  Not allowed
createBadge("fail");
`;

const packageText = `{
  "name": "badge",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "exports": {
    ".": {
      "import": "./index.js"
    },
    "./package.json": "./package.json"
  }
}
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("JSDoc", async () => {
  await writeFixture(fixtureUrl, {
    ["index.js"]: indexText,
    ["index.tst.ts"]: testText,
    ["package.json"]: packageText,
  });

  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  await assert.matchSnapshot(normalizeOutput(stderr), {
    fileName: `${testFileName}-jsdoc-stderr`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-jsdoc-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
