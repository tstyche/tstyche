import { describe, expect, test } from "@jest/globals";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "api-toBeCallableWith";

describe("toBeCallableWith", () => {
  test("arity check", () => {
    const { status, stderr, stdout } = spawnTyche(fixture, ["arity-check"]);

    expect(stdout).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });

  test("optional parameters", () => {
    const { status, stderr, stdout } = spawnTyche(fixture, ["optional-parameters"]);

    expect(stdout).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(status).toBe(1);
  });
});
