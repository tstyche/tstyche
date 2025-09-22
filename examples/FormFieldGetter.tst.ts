import { expect, test } from "tstyche";

type FormFieldGetter = <T, K extends keyof T>(form: T, field: K) => T[K];

const userForm = {
  name: "Alice",
  email: "alice@example.com",
};

test("FormFieldGetter", () => {
  expect<FormFieldGetter>().type.toBeCallableWith(userForm, "name");
  expect<FormFieldGetter>().type.toBeCallableWith(userForm, "email");

  expect<FormFieldGetter>().type.not.toBeCallableWith(userForm, "age");

  expect<FormFieldGetter>().type.not.toBeCallableWith(userForm);
  expect<FormFieldGetter>().type.not.toBeCallableWith();
});
