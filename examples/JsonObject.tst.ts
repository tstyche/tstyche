import { expect, test } from "tstyche";

type JsonValue = string | number | boolean | Array<JsonValue> | JsonObject;

interface JsonObject {
  [key: string]: JsonValue;
}

test("JsonObject", () => {
  expect<JsonObject>().type.toBeAssignableFrom({
    caption: "test",
  });

  expect<JsonObject>().type.toBeAssignableFrom({
    count: 100,
  });

  expect<JsonObject>().type.toBeAssignableFrom({
    isTest: true,
  });

  expect<JsonObject>().type.toBeAssignableFrom({
    values: [10, 20, { x: 1, y: 2 }, true, "test", ["a", "b"]],
  });

  expect<JsonObject>().type.toBeAssignableFrom({
    location: { name: "test", start: [1, 2], valid: false, x: 10, y: 20 },
  });

  expect<JsonObject>().type.not.toBeAssignableFrom({
    isTrue: () => true,
  });

  expect<JsonObject>().type.not.toBeAssignableFrom({
    kPlay: Symbol("play"),
  });
});
