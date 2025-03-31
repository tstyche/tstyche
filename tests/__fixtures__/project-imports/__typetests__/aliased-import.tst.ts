import { describe as tstDescribe, expect as tstExpect, it as tstIt, test as tstTest } from "tstyche";

tstIt.todo("is todo?");

tstIt("is string?", () => {
  tstExpect<string>().type.toBe<string>();
});

tstDescribe.only("is describe?", () => {
  tstTest.todo("is todo too?");

  tstTest("is void?", () => {
    tstExpect<void>().type.toBe<void>();
  });

  tstTest.skip("is never?", () => {
    tstExpect<never>().type.toBe<never>();
  });
});

tstTest("is never too?", () => {
  tstExpect<never>().type.toBe<never>();
});
