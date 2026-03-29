import fs from "node:fs/promises";
import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });
const storeUrl = new URL("./.store/", fixtureUrl);

await test("TypeScript versions", async (t) => {
  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await fs.cp(new URL("../examples", import.meta.url), new URL("./__typetests__/", fixtureUrl), {
    filter: (source) => !source.endsWith("tsconfig.json"),
    recursive: true,
  });

  await spawnTyche(fixtureUrl, ["--update"]);

  const manifestText = await fs.readFile(new URL("./store-manifest.json", storeUrl), { encoding: "utf8" });

  const { resolutions } = /** @type {{ resolutions: Record<string, string> }} */ (JSON.parse(manifestText));

  const versions = Object.entries(resolutions)
    .filter((resolution) => resolution[0].startsWith("5") || resolution[0].startsWith("6"))
    .map((resolution) => resolution[1]);

  const testCases = ["5.4.2", ...versions];

  for (const version of testCases) {
    await t.test(`uses TypeScript ${version} as the target`, async () => {
      await spawnTyche(fixtureUrl, ["--fetch", "--target", version]);

      const typescriptModule = new URL(`./typescript@${version}/lib/typescript.js`, storeUrl).toString();

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
        env: { ["TSTYCHE_TYPESCRIPT_MODULE"]: typescriptModule },
      });

      assert.equal(stderr, "");
      assert.match(stdout, new RegExp(`uses TypeScript ${version} with baseline TSConfig\n`));
      assert.equal(exitCode, 0);
    });
  }
});
