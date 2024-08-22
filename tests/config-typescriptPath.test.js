import { afterEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'TSTYCHE_TYPESCRIPT_PATH' environment variable", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("has default value", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(normalizeOutput(stdout), {
      typescriptPath: "<<cwd>>/node_modules/typescript/lib/typescript.js",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when path is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"]);

    const typescriptPath = fileURLToPath(new URL("./.store/typescript@5.2.2/lib/typescript.js", fixtureUrl));

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: {
        ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath,
      },
    });

    assert.match(stdout, /^uses TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
