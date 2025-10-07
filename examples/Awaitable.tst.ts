import { expect, test } from "tstyche";

type Awaitable<T> = T | PromiseLike<T>;

test("is assignable from?", () => {
  expect<Awaitable<string>>().type.toBeAssignableFrom("abc");
  expect<Awaitable<string>>().type.toBeAssignableFrom(Promise.resolve("abc"));

  expect<Awaitable<string>>().type.not.toBeAssignableFrom(123);
  expect<Awaitable<string>>().type.not.toBeAssignableFrom(Promise.resolve(123));
});
