import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "@jest/globals";
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

const fixture = "config-typescriptPath";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'TSTYCHE_TYPESCRIPT_PATH' environment variable", () => {
  test("uses provided path", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    spawnTyche(fixture, ["--install", "--target", "5.2.2"]);

    const typescriptPath = fileURLToPath(
      new URL("./.store/5.2.2/node_modules/typescript/lib/typescript.js", getFixtureUrl(fixture)),
    );

    const { status, stderr, stdout } = spawnTyche(fixture, [], {
      ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath,
    });

    expect(stdout).toMatch(/^uses TypeScript 5.2.2/);
    expect(stderr).toBe("");

    expect(status).toBe(0);
  });
});
