/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import { expect, test } from "tstyche";

type JsonValue = string | number | boolean | Array<JsonValue> | JsonObject;

interface JsonObject {
  [key: string]: JsonValue;
}

test("JsonObject", () => {
  expect<JsonObject>().type.toBeAssignable({
    caption: "test",
  });

  expect<JsonObject>().type.toBeAssignable({
    count: 100,
  });

  expect<JsonObject>().type.toBeAssignable({
    isTest: true,
  });

  expect<JsonObject>().type.toBeAssignable({
    values: [10, 20, { x: 1, y: 2 }, true, "test", ["a", "b"]],
  });

  expect<JsonObject>().type.toBeAssignable({
    location: { name: "test", start: [1, 2], valid: false, x: 10, y: 20 },
  });

  expect<JsonObject>().type.not.toBeAssignable({
    isTrue: () => true,
  });

  expect<JsonObject>().type.not.toBeAssignable({
    kPlay: Symbol("play"),
  });
});
