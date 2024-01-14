import { afterEach, describe, expect, test } from "@jest/globals";
import { existsSync } from "fs";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["./"],
};

const fixture = "config-storePath";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'TSTYCHE_STORE_PATH' environment variable", () => {
  test("uses provided path", async () => {
    const storeUrl = new URL("./dummy-store", getFixtureUrl(fixture));

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--install", "--target", "5.2.2"], {
      env: { ["TSTYCHE_STORE_PATH"]: "./dummy-store" },
    });

    expect(existsSync(storeUrl)).toBe(true);

    expect(stdout).toMatch(/^adds TypeScript 5.2.2 to /);
    expect(stdout).toMatch(/dummy-store\/5.2.2\r\n$/);
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
