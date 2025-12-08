import { describe, expect, test } from "tstyche";

describe("classes", () => {
  test("missing fields", () => {
    class Empty {}
    class A {
      x = "abc";
    }
    class B {
      x = "abc";
    }
    class C {
      y = "abc";
    }
    class D {
      x = "abc";
      y = "abc";
    }

    expect<Empty>().type.toBe<{}>();
    expect<Empty>().type.not.toBe<{ x: string }>();
    expect<Empty>().type.not.toBe<A>();

    expect<A>().type.toBe<{ x: string }>();
    expect<A>().type.not.toBe<{ y: string }>();

    expect<A>().type.toBe<B>();
    expect<A>().type.not.toBe<C>();
    expect<A>().type.not.toBe<D>();

    expect(A).type.toBe(B);
    expect<typeof A>().type.toBe<typeof B>();
  });

  test("field types", () => {
    class A {
      x = "abc";
    }
    class B {
      x = 123;
    }
    class C {
      x = 123;
      y = "abc";
    }
    class D {
      x = "abc";
      y = "abc";
    }

    expect<A>().type.toBe<{ x: string }>();
    expect<A>().type.not.toBe<{ x: number }>();

    expect<B>().type.toBe<{ x: number }>();
    expect<B>().type.not.toBe<A>();

    expect<C>().type.toBe<{ x: number; y: string }>();
    expect<C>().type.not.toBe<D>();

    expect(A).type.not.toBe(B);
    expect<typeof A>().type.not.toBe<typeof B>();

    expect(C).type.not.toBe(D);
    expect<typeof C>().type.not.toBe<typeof D>();
  });
});
