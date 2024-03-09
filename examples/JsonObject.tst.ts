/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import { expect, test } from "tstyche";

type JsonValue = string | number | boolean | Array<JsonValue> | JsonObject;

interface JsonObject {
  [key: string]: JsonValue;
}

test("JsonObject", () => {
  expect<JsonObject>().type.toBeAssignableWith({
    caption: "test",
  });

  expect<JsonObject>().type.toBeAssignableWith({
    count: 100,
  });

  expect<JsonObject>().type.toBeAssignableWith({
    isTest: true,
  });

  expect<JsonObject>().type.toBeAssignableWith({
    values: [10, 20, { x: 1, y: 2 }, true, "test", ["a", "b"]],
  });

  expect<JsonObject>().type.toBeAssignableWith({
    location: { name: "test", start: [1, 2], valid: false, x: 10, y: 20 },
  });

  expect<JsonObject>().type.not.toBeAssignableWith({
    isTrue: () => true,
  });

  expect<JsonObject>().type.not.toBeAssignableWith({
    kPlay: Symbol("play"),
  });
});
