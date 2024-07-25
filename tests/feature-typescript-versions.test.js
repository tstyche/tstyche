import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, test } from "poku";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const toAcceptPropsTestText = `import { expect, test } from "tstyche";

interface ButtonProps {
  text: string;
  type?: "reset" | "submit";
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>;
}

test("accepts props?", () => {
  expect(Button).type.toAcceptProps({ text: "Send" });
  expect(Button).type.toAcceptProps({ text: "Clear", type: "reset" as const });

  expect(Button).type.not.toAcceptProps({ text: "Download", type: "button" as const });
  expect(Button).type.not.toAcceptProps({});
});
`;

const toBeAssignableToTestText = `import { expect, test } from "tstyche";

test("is assignable to?", () => {
  expect(new Set(["abc"])).type.toBeAssignableTo<Set<string>>();
  expect(new Set([123])).type.toBeAssignableTo<Set<number>>();

  expect(new Set([123, "abc"])).type.not.toBeAssignableTo<Set<string>>();
  expect(new Set([123, "abc"])).type.not.toBeAssignableTo<Set<number>>();
});`;

const toBeAssignableWithTestText = `import { expect, test } from "tstyche";

type Awaitable<T> = T | PromiseLike<T>;

test("is assignable with?", () => {
  expect<Awaitable<string>>().type.toBeAssignableWith("abc");
  expect<Awaitable<string>>().type.toBeAssignableWith(Promise.resolve("abc"));

  expect<Awaitable<string>>().type.not.toBeAssignableWith(123);
  expect<Awaitable<string>>().type.not.toBeAssignableWith(Promise.resolve(123));
});`;

const toBeTestText = `import { expect, test } from "tstyche";

interface Sample {
  getLength: () => number;
  getWidth?: () => number;
}

expect<keyof Sample>().type.toBe<"getLength" | "getWidth">();
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
const storeUrl = new URL("./.store/", fixtureUrl);

await describe("TypeScript 4.x", async () => {
  if (process.versions.node.startsWith("16")) {
    // store is not supported on Node.js 16
    return;
  }

  await writeFixture(fixtureUrl, {
    // 'moduleResolution: "node"' does not support self-referencing, but TSTyche needs 'import from "tstyche"' to be able to collect test nodes
    ["__typetests__/toAcceptProps.test.tsx"]: `// @ts-expect-error\n${toAcceptPropsTestText}`,
    ["__typetests__/toBe.test.ts"]: `// @ts-expect-error\n${toBeTestText}`,
    ["__typetests__/toBeAssignableTo.test.ts"]: `// @ts-expect-error\n${toBeAssignableToTestText}`,
    ["__typetests__/toBeAssignableWith.test.ts"]: `// @ts-expect-error\n${toBeAssignableWithTestText}`,
    ["__typetests__/toHaveProperty.test.ts"]: `// @ts-expect-error\n${toHavePropertyTestText}`,
    ["__typetests__/toMatch.test.ts"]: `// @ts-expect-error\n${toMatchTestText}`,
    ["__typetests__/toRaiseError.test.ts"]: `// @ts-expect-error\n${toRaiseErrorTestText}`,
  });

  const testCases = ["4.0.2", "4.0.8", "4.1.6", "4.2.4", "4.3.5", "4.4.4", "4.5.5", "4.6.4", "4.7.4", "4.8.4", "4.9.5"];

  for (const version of testCases) {
    await test(`uses TypeScript ${version} as current target`, async () => {
      await spawnTyche(fixtureUrl, ["--install", "--target", version]);

      const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "current"], {
        env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
      });

      assert.match(stdout, RegExp(`^uses TypeScript ${version}\n`));
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  }

  await clearFixture(fixtureUrl);
});

await describe("TypeScript 5.x", async () => {
  if (process.versions.node.startsWith("16")) {
    // store is not supported on Node.js 16
    return;
  }

  await writeFixture(fixtureUrl, {
    ["__typetests__/toAcceptProps.test.tsx"]: toAcceptPropsTestText,
    ["__typetests__/toBe.test.ts"]: toBeTestText,
    ["__typetests__/toBeAssignableTo.test.ts"]: toBeAssignableToTestText,
    ["__typetests__/toBeAssignableWith.test.ts"]: toBeAssignableWithTestText,
    ["__typetests__/toHaveProperty.test.ts"]: toHavePropertyTestText,
    ["__typetests__/toMatch.test.ts"]: toMatchTestText,
    ["__typetests__/toRaiseError.test.ts"]: toRaiseErrorTestText,
  });

  await spawnTyche(fixtureUrl, ["--update"]);

  const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });

  const { resolutions } = /** @type {{ resolutions: Record<string, string> }} */ (JSON.parse(manifestText));

  const versionTags = Object.entries(resolutions)
    .filter((resolution) => resolution[0].startsWith("5"))
    .map((resolution) => resolution[1]);

  const testCases = ["5.0.2", ...versionTags];

  for (const version of testCases) {
    await test(`uses TypeScript ${version} as current target`, async () => {
      await spawnTyche(fixtureUrl, ["--install", "--target", version]);

      const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "current"], {
        env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
      });

      assert.match(stdout, RegExp(`^uses TypeScript ${version}\n`));
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  }

  await clearFixture(fixtureUrl);
});
