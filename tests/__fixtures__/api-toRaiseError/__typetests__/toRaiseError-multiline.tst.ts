import { expect, test } from "tstyche";

declare function lines(a: { b: string }): void;

test("expression raises matching type error", () => {
  expect(lines({})).type.toRaiseError(
    `Argument of type '{}' is not assignable to parameter of type '{ b: string; }'.
Property 'b' is missing in type '{}' but required in type '{ b: string; }'.`,
  );

  expect(lines({})).type.not.toRaiseError(
    `Argument of type '{}' is not assignable to parameter of type '{ b: string; }'.
Property 'b' is missing in type '{}' but required in type '{ b: string; }'.`,
  );
});

test("expression raises not matching type error", () => {
  expect(lines({})).type.not.toRaiseError(
    `Argument of type '{}' is not assignable to parameter of type '{ a: string; }'.
Property 'a' is missing in type '{}' but required in type '{ b: string; }'.`,
  );

  expect(lines({})).type.toRaiseError(
    `Argument of type '{}' is not assignable to parameter of type '{ a: string; }'.
Property 'a' is missing in type '{}' but required in type '{ a: string; }'.`,
  );
});
