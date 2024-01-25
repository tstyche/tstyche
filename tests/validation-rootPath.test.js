import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "validation-rootPath";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'rootPath' configuration file option", () => {
  test("when specified path does not exist", async () => {
    const config = {
      rootPath: "../nope",
    };

    await writeFixture(fixture, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--config ./config/tstyche.json"]);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot();

    expect(exitCode).toBe(1);
  });
});
