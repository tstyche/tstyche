import type React from "react";
import { describe, expect, test } from "tstyche";

describe("when source is an expression", () => {
  interface Props<T> {
    a: T;
    b: T;
  }

  function GenericComponent<T>(_props: Props<T>) {
    return "test";
  }

  test("accepts the given props", () => {
    expect(GenericComponent).type.toAcceptProps({ a: 1, b: 2 });
    expect(GenericComponent).type.not.toAcceptProps({ a: 1, b: 2 }); // fail

    expect(GenericComponent<string>).type.toAcceptProps({ a: "one", b: "two" });
    expect(GenericComponent<string>).type.not.toAcceptProps({ a: "one", b: "two" }); // fail
  });

  test("does not accept the given props", () => {
    expect(GenericComponent).type.not.toAcceptProps({ a: 1, b: "two" });
    expect(GenericComponent).type.toAcceptProps({ a: 1, b: "two" }); // fail: Type 'string' is not assignable to type 'number'

    expect(GenericComponent<string>).type.not.toAcceptProps({ a: 1, b: 2 });
    expect(GenericComponent<string>).type.toAcceptProps({ a: 1, b: 2 }); // fail: Type 'number' is not assignable to type 'string'
  });
});

describe("when source is a type", () => {
  interface Props<T> {
    a: T;
    b: T;
  }

  type GenericComponent = <T>(props: Props<T>) => React.JSX.Element;

  test("accepts the given props", () => {
    expect<GenericComponent>().type.toAcceptProps({ a: 1, b: 2 });
    expect<GenericComponent>().type.not.toAcceptProps({ a: 1, b: 2 }); // fail
  });

  test("does not accept the given props", () => {
    expect<GenericComponent>().type.not.toAcceptProps({ a: 1, b: "two" });
    expect<GenericComponent>().type.toAcceptProps({ a: 1, b: "two" }); // fail: Type 'string' is not assignable to type 'number'
  });
});
