import { expect, test } from "tstyche";

type One<T> = () => T;
declare const one: One<string>;

test("expression raises a type error", () => {
  expect(one("pass")).type.toRaiseError();
  expect(one("fail")).type.not.toRaiseError();
});

test("expression does not raise a type error", () => {
  expect(one()).type.not.toRaiseError();
  expect(one()).type.toRaiseError();
});

test("type expression raises a type error", () => {
  expect<One>().type.toRaiseError();
  expect<One>().type.not.toRaiseError();
});

test("type expression does not raise a type error", () => {
  expect<One<string>>().type.not.toRaiseError();
  expect<One<string>>().type.toRaiseError();
});

test("expression raises multiple type errors", () => {
  expect(() => {
    one("1");
    one("2");
    one("3");
  }).type.toRaiseError();
  expect(() => {
    one("1");
    one("2");
    one("3");
  }).type.not.toRaiseError();
});

test("expression raises a type error with matching message", () => {
  expect(one("pass")).type.toRaiseError("Expected 0 arguments");
  expect(one("fail")).type.not.toRaiseError("Expected 0 arguments");
});

test("expression raises a type error with matching message passed as a template literal", () => {
  expect(one("pass")).type.toRaiseError(`Expected 0 arguments`);
  expect(one("fail")).type.not.toRaiseError(`Expected 0 arguments`);
});

test("expression raises type error with not matching message", () => {
  expect(one("pass")).type.not.toRaiseError("Expected 2 arguments");
  expect(one("fail")).type.toRaiseError("Expected 2 arguments");
});

test("type expression raises a type error with matching message", () => {
  expect<One>().type.toRaiseError("requires 1 type argument");
  expect<One>().type.not.toRaiseError("requires 1 type argument");
});

test("type expression raises a type error with matching message passed as a template literal", () => {
  expect<One>().type.toRaiseError(`requires 1 type argument`);
  expect<One>().type.not.toRaiseError(`requires 1 type argument`);
});

test("type expression raises a type error with not matching message", () => {
  expect<One>().type.not.toRaiseError("requires type argument");
  expect<One>().type.toRaiseError("requires type argument");
});

test("expression raises a type error with expected code", () => {
  expect(one("pass")).type.toRaiseError(2554);
  expect(one("fail")).type.not.toRaiseError(2554);
});

test("expression raises a type error with not expected code", () => {
  expect(one("pass")).type.not.toRaiseError(2544);
  expect(one("fail")).type.toRaiseError(2544);
});

declare function two<T>(): void;
declare function two(a: string): void;

test("expression raises multiple type errors with matching messages", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
    "Expected 0 arguments",
  );

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.not.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
    "Expected 0 arguments",
  );
});

test("expression raises multiple type errors with not matching messages", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.not.toRaiseError(
    "Expected 0 arguments",
    "Argument of type 'number' is not assignable to parameter of type 'string'",
  );

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.toRaiseError(
    "Expected 0 arguments",
    "Argument of type 'number' is not assignable to parameter of type 'string'",
  );
});

test("expression raises multiple type errors with expected codes", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(2345, 2554);

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.not.toRaiseError(2345, 2554);
});

test("expression raises multiple type errors with not expected codes", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(2554, 2345);

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.not.toRaiseError(2554, 2345);
});

test("expression raises multiple type errors with matching messages and expected codes", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
    2554,
  );

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.not.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
    2554,
  );
});

test("expression raises multiple type errors with not matching messages and not expected codes", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    2554,
    "Argument of type 'number' is not assignable to parameter of type 'string'",
  );

  expect(() => {
    two(1000);
    two<string>("fail");
  }).type.not.toRaiseError(
    2554,
    "Argument of type 'number' is not assignable to parameter of type 'string'",
  );
});

test("expression raises more type errors than expected messages", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
  );
});

test("expression raises more type errors than expected codes", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(2345);
});

test("expression raises only one type error, but several messages are expected", () => {
  expect(() => {
    two(1111);
  }).type.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
    "Expected 0 arguments",
    "Expected 2 arguments",
  );
});

test("expression raises less type errors than expected messages", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(
    "Argument of type 'number' is not assignable to parameter of type 'string'",
    "Expected 0 arguments",
    "Expected 2 arguments",
  );
});

test("expression raises only one type error, but several codes are expected", () => {
  expect(() => {
    two<string>("pass");
  }).type.toRaiseError(2345, 2554, 2554);
});

test("expression raises less type errors than expected codes", () => {
  expect(() => {
    two(1111);
    two<string>("pass");
  }).type.toRaiseError(2345, 2554, 2554);
});
