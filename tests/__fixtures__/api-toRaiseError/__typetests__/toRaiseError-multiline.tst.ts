import { expect, test } from "tstyche";

declare function lines(a: { b: string }): void;

const sample = { b: 123 };

test("expression raises matching type error", () => {
  expect(lines(sample)).type.toRaiseError(
    `Argument of type '{ b: number; }' is not assignable to parameter of type '{ b: string; }'.
Types of property 'b' are incompatible.
Type 'number' is not assignable to type 'string'.`,
  );

  expect(lines(sample)).type.not.toRaiseError(
    `Argument of type '{ b: number; }' is not assignable to parameter of type '{ b: string; }'.
Types of property 'b' are incompatible.
Type 'number' is not assignable to type 'string'.`,
  );
});

test("expression raises not matching type error", () => {
  expect(lines(sample)).type.not.toRaiseError(
    `Argument of type '{ a: number; }' is not assignable to parameter of type '{ a: string; }'.
Types of property 'a' are incompatible.
Type 'number' is not assignable to type 'string'.`,
  );

  expect(lines(sample)).type.toRaiseError(
    `Argument of type '{ a: number; }' is not assignable to parameter of type '{ a: string; }'.
Types of property 'a' are incompatible.
Type 'number' is not assignable to type 'string'.`,
  );
});
