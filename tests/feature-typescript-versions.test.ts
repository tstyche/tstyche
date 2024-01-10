import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { afterAll, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

// this '@ts-expect-error' directive is not ideal, but TSTyche needs 'import from "tstyche"' to be able to collect test nodes
const toBeAssignableTestText = `// @ts-expect-error
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

const toEqualTestText = `// @ts-expect-error
import { expect, test } from "tstyche";

interface Sample {
  getLength: () => number;
  getWidth?: () => number;
}

test("is equal?", () => {
  expect<keyof Sample>().type.toEqual<"getLength" | "getWidth">();
});

`;

const toHavePropertyTestText = `// @ts-expect-error
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

const toMatchTestText = `// @ts-expect-error
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

const toRaiseErrorTestText = `// @ts-expect-error
import { expect, test } from "tstyche";

interface Matchers<R, T = unknown> {
  [key: string]: (expected: T) => R;
}

test("Matchers", () => {
  expect<Matchers<void, string>>().type.not.toRaiseError();

  expect<Matchers<void>>().type.not.toRaiseError();

  expect<Matchers>().type.toRaiseError("requires between 1 and 2 type arguments");
});`;

// TODO use default tsconfig after implementing
const tsconfig = {
  compilerOptions: {
    module: "esnext",
    moduleResolution: "node",
    strictNullChecks: true,
  },
  include: ["./"],
};

const fixture = "feature-typescript-versions";

await writeFixture(fixture, {
  ["__typetests__/toBeAssignable.test.ts"]: toBeAssignableTestText,
  ["__typetests__/toEqual.test.ts"]: toEqualTestText,
  ["__typetests__/toHaveProperty.test.ts"]: toHavePropertyTestText,
  ["__typetests__/toMatch.test.ts"]: toMatchTestText,
  ["__typetests__/toRaiseError.test.ts"]: toRaiseErrorTestText,
  ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
});

await spawnTyche(fixture, ["--update"]);

const storeUrl = new URL("./.store/", getFixtureUrl(fixture));

const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });
const { resolutions } = JSON.parse(manifestText) as { resolutions: Record<string, string> };

const versionTags = Object.entries(resolutions)
  .map(([tag, version]) => {
    if (["beta", "latest", "next", "rc"].includes(tag)) {
      return;
    }

    return version;
  })
  .filter((version) => version != null) as Array<string>;

afterAll(async () => {
  await clearFixture(fixture);
});

test.each(versionTags)("uses TypeScript %s", async (version) => {
  await spawnTyche(fixture, ["--install", "--target", version]);

  const typescriptPath = fileURLToPath(new URL(`./${version}/node_modules/typescript/lib/typescript.js`, storeUrl));

  const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current"], {
    env: { ["TSTYCHE_TYPESCRIPT_PATH"]: typescriptPath },
  });

  expect(stdout).toMatch(RegExp(`^uses TypeScript ${version}`));
  expect(stderr).toBe("");

  expect(exitCode).toBe(0);
});
