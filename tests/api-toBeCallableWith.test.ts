import { describe, expect, test } from "@jest/globals";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-toBeCallableWith";

describe("toBeCallableWith", () => {
  test("parameter arity", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["parameter-arity"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("optional parameters", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["optional-parameters"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("default parameters", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["default-parameters"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});
