import { expect, test } from "tstyche";

test("missing fields", () => {
  class Empty {}
  class A {
    x!: string;
  }
  class B {
    x!: string;
  }
  class C {
    y!: string;
  }
  class D {
    x!: string;
    y!: string;
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
    x!: string;
  }
  class B {
    x!: number;
  }
  class C {
    x!: number;
    y!: string;
  }
  class D {
    x!: string;
    y!: string;
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

test("'public' fields", () => {
  class A {
    public x!: string;
  }
  class B {
    x!: string;
  }

  expect<A>().type.toBe<{ x: string }>();
  expect<B>().type.toBe<{ x: string }>();

  expect<A>().type.toBe<B>();
  expect<typeof A>().type.toBe<typeof B>();
});

test("'private' fields", () => {
  class A {
    x!: string;
    y!: number;
  }
  class B {
    private x!: string;
    y!: number;
  }
  class C {
    private x!: string;
    y!: number;
  }
  class D {
    #x!: string;
    y!: number;
  }

  expect<A>().type.toBe<{ x: string; y: number }>();
  expect<B>().type.not.toBe<{ x: string; y: number }>();
  expect<B>().type.not.toBe<{ y: number }>();
  expect<C>().type.not.toBe<{ x: string; y: number }>();
  expect<C>().type.not.toBe<{ y: number }>();
  expect<D>().type.not.toBe<{ x: string; y: number }>();
  expect<D>().type.not.toBe<{ y: number }>();

  expect<B>().type.not.toBe<A>();
  expect<B>().type.not.toBe<C>();
  expect<typeof B>().type.not.toBe<typeof C>();

  expect<D>().type.not.toBe<A>();
  expect<D>().type.not.toBe<B>();
});

test("'protected' fields", () => {
  class A {
    x!: string;
    y!: number;
  }
  class B {
    protected x!: string;
    y!: number;
  }
  class C {
    protected x!: string;
    y!: number;
  }

  expect<A>().type.toBe<{ x: string; y: number }>();
  expect<B>().type.not.toBe<{ x: string; y: number }>();
  expect<B>().type.not.toBe<{ y: number }>();
  expect<C>().type.not.toBe<{ x: string; y: number }>();
  expect<C>().type.not.toBe<{ y: number }>();

  expect<B>().type.not.toBe<A>();
  expect<B>().type.not.toBe<C>();
  expect<typeof B>().type.not.toBe<typeof C>();
});

test("inheritance", () => {
  class A {
    x!: string;
  }
  class B extends A {
    y!: number;
  }

  expect<A>().type.toBe<{ x: string }>();
  expect<B>().type.toBe<{ x: string; y: number }>();
  expect<B>().type.not.toBe<{ y: number }>();

  expect<B>().type.not.toBe<A>();
  expect<typeof B>().type.not.toBe<typeof A>();
});

test("missing constructor", () => {
  class A {
    x!: string;
  }
  class B {
    x: string;

    constructor(x: string) {
      this.x = x;
    }
  }
  class C {
    x!: string;

    // biome-ignore lint/complexity/noUselessConstructor: testing
    constructor() {
      // ...
    }
  }

  expect(A).type.not.toBe(B);
  expect(A).type.toBe(C);
});

test("constructor signature", () => {
  class A {
    x: string;

    constructor(x: string) {
      this.x = x;
    }
  }
  class B {
    x: string;

    constructor(x: string) {
      this.x = x;
    }
  }
  class C {
    x: number;

    constructor(x: number) {
      this.x = x;
    }
  }

  expect(A).type.toBe(B);
  expect(B).type.not.toBe(C);
});
