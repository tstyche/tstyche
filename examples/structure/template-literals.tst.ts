import { expect, test } from "tstyche";

test("element arity", () => {
  type A = `a-${string}`;
  type B = `b-${number}`;

  expect<A>().type.toBe<`a-${string}`>();
  expect<A>().type.not.toBe<`a-`>();
  expect<A>().type.not.toBe<`a-${string}-${string}`>();

  expect<B>().type.toBe<`b-${number}`>();
  expect<B>().type.not.toBe<`b-`>();
  expect<B>().type.not.toBe<`b-${number}-${number}`>();
});

test("element types", () => {
  type A = `a-${string}`;
  type B = `b-${number}`;

  expect<A>().type.toBe<`a-${string}`>();
  expect<A>().type.not.toBe<`b-${string}`>();
  expect<A>().type.not.toBe<`a-${number}`>();

  expect<B>().type.toBe<`b-${number}`>();
  expect<B>().type.not.toBe<`a-${number}`>();
  expect<B>().type.not.toBe<`b-${string}`>();
});

test("unions", () => {
  type EventType = "click" | "hover" | "keypress";
  type EventHandlers = `on${Capitalize<EventType>}`;

  expect<EventHandlers>().type.toBe<"onClick" | "onHover" | "onKeypress">();
});

test("string manipulation", () => {
  type A = "Sample";
  type B = "sample";

  expect<Uppercase<A>>().type.toBe<"SAMPLE">();
  expect<Lowercase<A>>().type.toBe<"sample">();
  expect<Capitalize<B>>().type.toBe<"Sample">();
  expect<Uncapitalize<A>>().type.toBe<"sample">();
});
