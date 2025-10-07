import fs from "node:fs/promises";
import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const subtypeTestText = `import { expect } from "tstyche";

class Queue<T> {
  #entries: Array<T> = [];

  get size(): number {
    return this.#entries.length;
  }

  enqueue(item: T): void {
    this.#entries.push(item);
  }
}

expect(omit(new Queue(), "enqueue")).type.toBe<{ readonly size: number }>();
expect<Omit<Queue<string>, "enqueue">>().type.toBe<{ readonly size: number }>();

expect(pick(new Queue(), "size")).type.toBe<{ readonly size: number }>();
expect<Pick<Queue<string>, "size">>().type.toBe<{ readonly size: number }>();
`;

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

const toBeAssignableFromTestText = `import { expect, test } from "tstyche";

type Awaitable<T> = T | PromiseLike<T>;

test("is assignable from?", () => {
  expect<Awaitable<string>>().type.toBeAssignableFrom("abc");
  expect<Awaitable<string>>().type.toBeAssignableFrom(Promise.resolve("abc"));

  expect<Awaitable<string>>().type.not.toBeAssignableFrom(123);
  expect<Awaitable<string>>().type.not.toBeAssignableFrom(Promise.resolve(123));
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

await test("TypeScript 5.x", async (t) => {
  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await writeFixture(fixtureUrl, {
    ["__typetests__/subtype.test.ts"]: `import { omit, pick } from "tstyche"\n${subtypeTestText}`,
    ["__typetests__/toAcceptProps.test.tsx"]: toAcceptPropsTestText,
    ["__typetests__/toBe.test.ts"]: toBeTestText,
    ["__typetests__/toBeAssignableTo.test.ts"]: toBeAssignableToTestText,
    ["__typetests__/toBeAssignableFrom.test.ts"]: toBeAssignableFromTestText,
    ["__typetests__/toHaveProperty.test.ts"]: toHavePropertyTestText,
    ["__typetests__/toRaiseError.test.ts"]: toRaiseErrorTestText,
  });

  await spawnTyche(fixtureUrl, ["--update"]);

  const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });

  const { resolutions } = /** @type {{ resolutions: Record<string, string> }} */ (JSON.parse(manifestText));

  const versions = Object.entries(resolutions)
    .filter((resolution) => resolution[0].startsWith("5"))
    .map((resolution) => resolution[1]);

  const testCases = ["5.0.2", ...versions];

  for (const version of testCases) {
    await t.test(`uses TypeScript ${version} as the target`, async () => {
      await spawnTyche(fixtureUrl, ["--fetch", "--target", version]);

      const typescriptModule = new URL(`./typescript@${version}/lib/typescript.js`, storeUrl).toString();

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
        env: { ["TSTYCHE_TYPESCRIPT_MODULE"]: typescriptModule },
      });

      assert.equal(stderr, "");
      assert.match(stdout, new RegExp(`uses TypeScript ${version}\n`));
      assert.equal(exitCode, 0);
    });
  }
});
