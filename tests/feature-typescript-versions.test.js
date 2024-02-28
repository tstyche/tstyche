import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { after, before, describe, test } from "mocha";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const toBeAssignableTestText = `import { expect, test } from "tstyche";

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

const toEqualTestText = `import { expect, test } from "tstyche";

interface Sample {
  getLength: () => number;
  getWidth?: () => number;
}

test("is equal?", () => {
  expect<keyof Sample>().type.toEqual<"getLength" | "getWidth">();
});

`;

const toHavePropertyTestText = `import { expect } from "tstyche";

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

const toMatchTestText = `import { expect, test } from "tstyche";

interface Options {
  readonly environment?: string;
  timers?: "fake" | "real";
}

const options: Options = {};

test("is a match?", () => {
  expect(options).type.toMatch<{ readonly environment?: string }>();
  expect(options).type.toMatch<{ timers?: "fake" | "real" }>();
});
`;

const toRaiseErrorTestText = `import { expect, test } from "tstyche";

interface Matchers<R, T = unknown> {
  [key: string]: (expected: T) => R;
}

test("Matchers", () => {
  expect<Matchers<void, string>>().type.not.toRaiseError();

  expect<Matchers<void>>().type.not.toRaiseError();

  expect<Matchers>().type.toRaiseError("requires between 1 and 2 type arguments");
});`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await writeFixture(fixtureUrl);

await spawnTyche(fixtureUrl, ["--update"]);

const storeUrl = new URL("./.store/", fixtureUrl);

const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { resolutions } = /** @type {{ resolutions: Record<string, string> }} */ (JSON.parse(manifestText));

const versionTags = Object.entries(resolutions)
  .filter((resolution) => resolution[0].startsWith("5"))
  .map((resolution) => resolution[1]);

after(async function() {
  await clearFixture(fixtureUrl);
});

describe("TypeScript 4.x", function() {
  before(async function() {
    await writeFixture(fixtureUrl, {
      // 'moduleResolution: "node"' does not support self-referencing, but TSTyche needs 'import from "tstyche"' to be able to collect test nodes
      ["__typetests__/toBeAssignable.test.ts"]: `// @ts-expect-error\n${toBeAssignableTestText}`,
      ["__typetests__/toEqual.test.ts"]: `// @ts-expect-error\n${toEqualTestText}`,
      ["__typetests__/toHaveProperty.test.ts"]: `// @ts-expect-error\n${toHavePropertyTestText}`,
      ["__typetests__/toMatch.test.ts"]: `// @ts-expect-error\n${toMatchTestText}`,
      ["__typetests__/toRaiseError.test.ts"]: `// @ts-expect-error\n${toRaiseErrorTestText}`,
    });
  });

  const testCases = [
    "4.0.2",
    "4.0.8",
    "4.1.6",
    "4.2.4",
    "4.3.5",
    "4.4.4",
    "4.5.5",
    "4.6.4",
    "4.7.4",
    "4.8.4",
    "4.9.5",
  ];

  testCases.forEach((version) => {
    test("uses TypeScript %s as current target", async function() {
      await spawnTyche(fixtureUrl, ["--install", "--target", version]);

      const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "current"], {
        env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
      });

      assert.match(stdout, RegExp(`^uses TypeScript ${version}\n`));
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });
});

describe("TypeScript 5.x", function() {
  before(async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeAssignable.test.ts"]: toBeAssignableTestText,
      ["__typetests__/toEqual.test.ts"]: toEqualTestText,
      ["__typetests__/toHaveProperty.test.ts"]: toHavePropertyTestText,
      ["__typetests__/toMatch.test.ts"]: toMatchTestText,
      ["__typetests__/toRaiseError.test.ts"]: toRaiseErrorTestText,
    });
  });

  const testCases = [
    "5.0.2",
    ...versionTags,
  ];

  testCases.forEach((version) => {
    test("uses TypeScript %s as current target", async function() {
      await spawnTyche(fixtureUrl, ["--install", "--target", version]);

      const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "current"], {
        env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
      });

      assert.match(stdout, RegExp(`^uses TypeScript ${version}\n`));
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });
});
