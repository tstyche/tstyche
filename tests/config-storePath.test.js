import { existsSync } from "node:fs";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("config-storePath", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'TSTYCHE_STORE_PATH' environment variable", () => {
  test("has default value", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    expect(JSON.parse(stdout)).toHaveProperty("storePath");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when specified, uses the path", async () => {
    const storeUrl = new URL("./dummy-store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--install", "--target", "5.2.2"], {
      env: {
        ["TSTYCHE_STORE_PATH"]: "./dummy-store",
      },
    });

    expect(existsSync(storeUrl)).toBe(true);

    expect(stdout).toMatch(/^adds TypeScript 5.2.2 to /);
    expect(stdout).toMatch(/dummy-store\/5.2.2\n$/);
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
