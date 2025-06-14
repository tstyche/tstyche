import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'// @ts-expect-error' directive", async (t) => {
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
      ["tstyche.config.json"]: JSON.stringify({ checkSuppressedErrors: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
