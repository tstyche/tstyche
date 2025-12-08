import { expect, test } from "tstyche";

test("edge cases", () => {
  expect<[...any]>().type.toBe<[...Array<any>]>();
  expect<[...Array<any>]>().type.toBe<[...any]>();

  expect<[...Array<string>]>().type.toBe<Array<string>>();
  expect<[...Array<string>]>().type.not.toBe<[string]>();
  expect<[string]>().type.not.toBe<[...Array<string>]>();

  expect<Array<string>>().type.not.toBe<[string]>();
  expect<[string]>().type.not.toBe<Array<string>>();
});

test("element arity", () => {
  type A = [];
  type B = [string];
  type C = [string, string];

  expect<A>().type.toBe<[]>();
  expect<A>().type.not.toBe<[string]>();

  expect<B>().type.toBe<[string]>();
  expect<B>().type.not.toBe<[]>();
  expect<B>().type.not.toBe<[string, string]>();

  expect<C>().type.toBe<[string, string]>();
  expect<C>().type.not.toBe<[]>();
  expect<C>().type.not.toBe<[string]>();
});

test("element types", () => {
  type A = [string];
  type B = [number];
  type C = [string, number];

  expect<A>().type.toBe<[string]>();
  expect<A>().type.not.toBe<[number]>();

  expect<B>().type.toBe<[number]>();
  expect<B>().type.not.toBe<[string]>();

  expect<C>().type.toBe<[string, number]>();
  expect<C>().type.not.toBe<[string, string]>();
  expect<C>().type.not.toBe<[number, number]>();
});

test("optional elements", () => {
  type A = [string?];
  type B = [string, number?];

  expect<A>().type.toBe<[string?]>();
  expect<A>().type.not.toBe<[]>();
  expect<A>().type.not.toBe<[string]>();

  expect<B>().type.toBe<[string, number?]>();
  expect<B>().type.not.toBe<[string]>();
  expect<B>().type.not.toBe<[string, number]>();
});

test("spread elements", () => {
  type A = [number, ...Array<string>];
  type B = [number, boolean?, ...Array<string>];
  type C = [...Array<string>, object];

  expect<A>().type.toBe<[number, ...Array<string>]>();
  expect<A>().type.not.toBe<[number, ...Array<number>]>();
  expect<A>().type.not.toBe<[number]>();

  expect<B>().type.toBe<[number, boolean?, ...Array<string>]>();
  expect<B>().type.not.toBe<[number, ...Array<string>]>();

  expect<B>().type.toBe<[number, ...[boolean?, ...Array<string>]]>();
  expect<B>().type.not.toBe<[number, [boolean?, ...Array<string>]]>();
  expect<B>().type.not.toBe<[number, [...Array<string>]]>();

  expect<C>().type.toBe<[...Array<string>, object]>();
  expect<C>().type.not.toBe<[...Array<number>, object]>();
  expect<C>().type.not.toBe<[number, object]>();
});

test("readonly tuples", () => {
  type A = readonly [string];

  expect<A>().type.toBe<readonly [string]>();
  expect<A>().type.not.toBe<readonly [number]>();
  expect<A>().type.not.toBe<[string]>();
});

test("named elements", () => {
  type MaxMin = [max: number, min: number];

  expect<MaxMin>().type.toBe<[max: number, min: number]>();
  expect<MaxMin>().type.toBe<[number, number]>();
});

test("generic tuples", () => {
  type AddMax<T extends Array<unknown>> = [max: number, ...rest: T];

  type MaxMin = AddMax<[min: number]>;
  type MaxMinDiameter = AddMax<[min: number, diameter: number]>;

  expect<MaxMin>().type.toBe<[max: number, min: number]>();
  expect<MaxMin>().type.not.toBe<[max: number, ...min: Array<number>]>();

  expect<MaxMinDiameter>().type.toBe<[max: number, min: number, diameter: number]>();
  expect<MaxMinDiameter>().type.not.toBe<[max: number, ...min: Array<number>]>();
});

test("additional properties", () => {
  type A = [a: string, b: number] & { x: boolean };

  expect<A>().type.toBe<[string, number] & { x: boolean }>();
  expect<A>().type.not.toBe<[string, number] & { x: string }>();
  expect<A>().type.not.toBe<[string, number] & { y: boolean }>();
  expect<A>().type.not.toBe<[string, number]>();
});
