/// <reference types="node" />
import assert from "node:assert";
import test from "node:test";
import * as tstyche from "tstyche";

function milliseconds(value: number) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value * 1000;
  }

  throw new Error("Not a number");
}

test("milliseconds", () => {
  const sample = milliseconds(10);

  assert.equal(sample, 10_000);
  tstyche.expect(sample).type.toBe<number>();

  // Will pass as a type test and not throw at runtime
  tstyche.expect(milliseconds).type.not.toBeCallableWith("20");
});
