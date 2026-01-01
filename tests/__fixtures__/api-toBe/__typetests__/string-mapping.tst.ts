import { expect, test } from "tstyche";

test("signatures", () => {
  type A = <T extends string>(a: T) => Capitalize<T>;
  type B = <T extends string>(a: T) => Uncapitalize<T>;
  type C = <T extends "length" | "width">(a: T) => Capitalize<T>;

  expect<A>().type.toBe<<T extends string>(a: T) => Capitalize<T>>();
  expect<A>().type.not.toBe<<T extends string>(a: T) => Uncapitalize<T>>();
  expect<A>().type.not.toBe<<T extends string>(a: T) => T>();
  expect<A>().type.not.toBe<<T extends string>(a: T) => string>();

  expect<B>().type.toBe<<T extends string>(a: T) => Uncapitalize<T>>();
  expect<B>().type.not.toBe<<T extends string>(a: T) => Capitalize<T>>();
  expect<B>().type.not.toBe<<T extends string>(a: T) => T>();
  expect<B>().type.not.toBe<<T extends string>(a: T) => string>();

  expect<C>().type.toBe<<T extends "length" | "width">(a: T) => Capitalize<T>>();
  expect<C>().type.not.toBe<<T extends "length" | "width">(a: T) => Uncapitalize<T>>();
  expect<C>().type.not.toBe<<T extends "length" | "width">(a: T) => T>();
  expect<C>().type.not.toBe<<T extends "length" | "width">(a: T) => "length" | "width">();

  expect<A>().type.not.toBe<B>();
  expect<A>().type.not.toBe<C>();

  expect<B>().type.not.toBe<A>();
  expect<B>().type.not.toBe<C>();

  expect<C>().type.not.toBe<A>();
  expect<C>().type.not.toBe<B>();
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
