import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'TSTYCHE_FETCH_TIMEOUT' environment variable", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("has default value", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      fetchTimeout: 30,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when timeout is specified", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"], {
      env: {
        ["TSTYCHE_FETCH_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://registry.npmjs.org'.",
      "",
      "The request timeout of 0.001s was exceeded.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });
});

await test("'TSTYCHE_TIMEOUT' environment variable", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when timeout is specified", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"], {
      env: {
        ["TSTYCHE_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://registry.npmjs.org'.",
      "",
      "The request timeout of 0.001s was exceeded.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });
});
