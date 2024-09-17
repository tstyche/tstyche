/// <reference types="node" />
import assert from "node:assert";
import test from "node:test";
import * as tstyche from "tstyche";

function secondItem<T>(target: Array<T>): T | undefined {
  return target[1];
}

test("handles numbers", () => {
  assert.strictEqual(secondItem([1, 2, 3]), 2);

  tstyche.expect(secondItem([1, 2, 3])).type.toBe<number | undefined>();
});
