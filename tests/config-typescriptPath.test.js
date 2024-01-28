import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("config-typescriptPath", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_TYPESCRIPT_PATH' environment variable", () => {
  test("has default value", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    expect(JSON.parse(stdout)).toHaveProperty("typescriptPath");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  describe("'TSTYCHE_TYPESCRIPT_PATH' environment variable", () => {
    test("uses provided path", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"]);

      const typescriptPath = fileURLToPath(
        new URL("./.store/5.2.2/node_modules/typescript/lib/typescript.js", fixtureUrl),
      );

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
        env: {
          ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath,
        },
      });

      expect(stdout).toMatch(/^uses TypeScript 5.2.2/);
      expect(stderr).toBe("");

      expect(exitCode).toBe(0);
    });
  });
});
