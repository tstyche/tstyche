import { expect, test } from "tstyche";

type One = () => void;
declare const one: One;

test("has matcher type error?", () => {
  expect(one()).type.toBeVoid(true);
});

test("has assertion type error?", () => {
  expect(one("pass")).type.toRaiseError();

  expect(one("fail")).type.toBeVoid();
});
