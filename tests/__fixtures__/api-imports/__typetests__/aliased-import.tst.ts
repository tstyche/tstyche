import { describe as tstDescribe, expect as tstExpect, it as tstIt, test as tstTest } from "tstyche";

tstIt.todo("is todo?");

tstIt("is string?", () => {
  tstExpect<string>().type.toBeString();
});

tstDescribe.only("is describe?", () => {
  tstTest.todo("is todo too?");

  tstTest("is void?", () => {
    tstExpect<void>().type.toBeVoid();
  });

  tstTest.skip("is never?", () => {
    tstExpect<never>().type.toBeNever();
  });
});

tstTest("is never too?", () => {
  tstExpect<never>().type.toBeNever();
});
