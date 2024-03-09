import { expect, test } from "tstyche";

type Awaitable<T> = T | PromiseLike<T>;

test("is assignable with?", () => {
  expect<Awaitable<string>>().type.toBeAssignableWith("abc");
  expect<Awaitable<string>>().type.toBeAssignableWith(Promise.resolve("abc"));

  expect<Awaitable<string>>().type.not.toBeAssignableWith(123);
  expect<Awaitable<string>>().type.not.toBeAssignableWith(Promise.resolve(123));
});
