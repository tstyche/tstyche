import * as tst from "tstyche";

tst.it.todo("is todo?");

tst.it("is string?", () => {
  tst.expect<string>().type.toBeString();
});

tst.describe.only("is describe?", () => {
  tst.test.todo("is todo too?");

  tst.test("is void?", () => {
    tst.expect<void>().type.toBeVoid();
  });

  tst.test.skip("is never?", () => {
    tst.expect<never>().type.toBeNever();
  });
});

tst.test("is never too?", () => {
  tst.expect<never>().type.toBeNever();
});
