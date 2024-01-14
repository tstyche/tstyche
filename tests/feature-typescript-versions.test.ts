import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const toBeAssignableTestText = `
import { expect, test } from "tstyche";

interface Sample {
  locale?: Array<"en" | "de">;
  root?: string;
}

test("is assignable?", () => {
  expect<Sample>().type.toBeAssignable({});

  expect<Sample>().type.toBeAssignable({
    locale: ["en" as const, "de" as const],
    root: "./",
  });
});`;

const toEqualTestText = `
import { expect, test } from "tstyche";

interface Sample {
  getLength: () => number;
  getWidth?: () => number;
}

test("is equal?", () => {
  expect<keyof Sample>().type.toEqual<"getLength" | "getWidth">();
});

`;

const toHavePropertyTestText = `
import { expect } from "tstyche";

interface Sample {
  description: string;
  getLength: () => number;
  getWidth?: () => number;
}

expect<Sample>().type.toHaveProperty("description");
expect<Sample>().type.toHaveProperty("getLength");

expect<Sample>().type.not.toHaveProperty("setup");
expect<Sample>().type.not.toHaveProperty("teardown");
`;

const toMatchTestText = `
import { expect, test } from "tstyche";

interface Options {
  environment?: string;
  timers?: "fake" | "real";
}

const options: Options = {};

test("is a match?", () => {
  expect(options).type.toMatch<{ environment?: string }>();
  expect(options).type.toMatch<{ timers?: "fake" | "real" }>();
});
`;

const toRaiseErrorTestText = `
import { expect, test } from "tstyche";

interface Matchers<R, T = unknown> {
  [key: string]: (expected: T) => R;
}

test("Matchers", () => {
  expect<Matchers<void, string>>().type.not.toRaiseError();

  expect<Matchers<void>>().type.not.toRaiseError();

  expect<Matchers>().type.toRaiseError("requires between 1 and 2 type arguments");
});`;

const fixture = "feature-typescript-versions";

await writeFixture(fixture);

await spawnTyche(fixture, ["--update"]);

const storeUrl = new URL("./.store/", getFixtureUrl(fixture));

const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });
const { resolutions } = JSON.parse(manifestText) as { resolutions: Record<string, string> };

const versionTags = Object.entries(resolutions)
  .filter((resolution) => resolution[0].startsWith("5"))
  .map((resolution) => resolution[1]);

afterAll(async () => {
  await clearFixture(fixture);
});

describe("TypeScript 4.x", () => {
  beforeAll(async () => {
    await writeFixture(fixture, {
      // 'moduleResolution: "node"' does not support self-referencing, but TSTyche needs 'import from "tstyche"' to be able to collect test nodes
      ["__typetests__/toBeAssignable.test.ts"]: `// @ts-expect-error${toBeAssignableTestText}`,
      ["__typetests__/toEqual.test.ts"]: `// @ts-expect-error${toEqualTestText}`,
      ["__typetests__/toHaveProperty.test.ts"]: `// @ts-expect-error${toHavePropertyTestText}`,
      ["__typetests__/toMatch.test.ts"]: `// @ts-expect-error${toMatchTestText}`,
      ["__typetests__/toRaiseError.test.ts"]: `// @ts-expect-error${toRaiseErrorTestText}`,
    });
  });

  test.each([
    "4.0.2",
    "4.0.8",
    "4.1.6",
    "4.2.4",
    "4.3.5",
    "4.4.4",
    "4.5.5",
    "4.6.4",
    "4.7.2",
    "4.7.4",
    "4.8.4",
    "4.9.5",
  ])("uses TypeScript %s as current target", async (version) => {
    await spawnTyche(fixture, ["--install", "--target", version]);

    const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current"], {
      env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
    });

    expect(stdout).toMatch(RegExp(`^uses TypeScript ${version}\r\n`));
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});

describe("TypeScript 5.x", () => {
  beforeAll(async () => {
    await writeFixture(fixture, {
      ["__typetests__/toBeAssignable.test.ts"]: toBeAssignableTestText,
      ["__typetests__/toEqual.test.ts"]: toEqualTestText,
      ["__typetests__/toHaveProperty.test.ts"]: toHavePropertyTestText,
      ["__typetests__/toMatch.test.ts"]: toMatchTestText,
      ["__typetests__/toRaiseError.test.ts"]: toRaiseErrorTestText,
    });
  });

  test.each(["5.0.2", ...versionTags])("uses TypeScript %s as current target", async (version) => {
    await spawnTyche(fixture, ["--install", "--target", version]);

    const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current"], {
      env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
    });

    expect(stdout).toMatch(RegExp(`^uses TypeScript ${version}\r\n`));
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
