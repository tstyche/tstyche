import { expect, test } from "tstyche";

test("signatures", () => {
  type A = <T extends string>() => Capitalize<T>;
  type B = <T extends string>() => Uncapitalize<T>;
  type C = <T extends "length" | "width">() => Capitalize<T>;

  expect<A>().type.toBe<<T extends string>() => Capitalize<T>>();
  expect<A>().type.toBe<<T extends string>() => Capitalize<T>>();
  expect<C>().type.toBe<<T extends "length" | "width">() => Capitalize<T>>();

  expect<A>().type.not.toBe<B>();
  expect<A>().type.not.toBe<C>();

  expect<B>().type.not.toBe<A>();
  expect<B>().type.not.toBe<C>();
});

test("unions", () => {
  type EventType = "click" | "hover" | "keypress";
  type EventHandlers = `on${Capitalize<EventType>}`;

  expect<EventHandlers>().type.toBe<"onClick" | "onHover" | "onKeypress">();
});

test("strings", () => {
  type A = "Sample";
  type B = "sample";

  expect<Uppercase<A>>().type.toBe<"SAMPLE">();
  expect<Lowercase<A>>().type.toBe<"sample">();
  expect<Capitalize<B>>().type.toBe<"Sample">();
  expect<Uncapitalize<A>>().type.toBe<"sample">();
});
