import { expect, test } from "tstyche";

type One<T> = () => T;
declare const one: One<string>;

test("expression raises matching type error", () => {
  expect(one("pass")).type.toRaiseError(/Expected \d arguments/);
  expect(one("fail")).type.not.toRaiseError(/Expected \d arguments/);
});

test("expression raises not matching type error", () => {
  expect(one("pass")).type.not.toRaiseError(/Expected \s arguments/);
  expect(one("fail")).type.toRaiseError(/Expected \s arguments/);
});

test("type expression raises matching type error", () => {
  expect<One>().type.toRaiseError(/requires \d type argument/);
  expect<One>().type.not.toRaiseError(/requires \d type argument/);
});

test("type expression raises not matching type error", () => {
  expect<One>().type.not.toRaiseError(/requires \s type argument/);
  expect<One>().type.toRaiseError(/requires \s type arguments/);
});

declare function two<T>(): void;
declare function two(a: string): void;

test("expression raises multiple matching type errors", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    /^Argument of type 'number' is not assignable to parameter of type 'string'.$/,
    /expected \d arguments/i,
  );

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.not.toRaiseError(
    /^Argument of type 'number' is not assignable to parameter of type 'string'.$/,
    /expected \d arguments/i,
  );
});

test("expression raises multiple not matching type errors", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.not.toRaiseError(
    /Expected \s arguments/,
    /^Argument of type 'number' is not assignable to parameter of type 'string'.$/,
  );

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.toRaiseError(
    /Expected \s arguments/,
    /^Argument of type 'number' is not assignable to parameter of type 'string'.$/,
  );
});

test("expression raises more type errors than expected", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    /^Argument of type 'number' is not assignable to parameter of type 'string'.$/,
  );
});

test("expression raises less type errors than expected messages", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    /^Argument of type 'number' is not assignable to parameter of type 'string'.$/,
    /Expected \d arguments/,
    /Expected \d arguments/,
  );
});
