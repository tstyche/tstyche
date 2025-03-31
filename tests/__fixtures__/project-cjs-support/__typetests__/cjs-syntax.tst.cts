import tstyche = require("tstyche");

tstyche.test("is supported?", () => {
  tstyche.expect<void>().type.toBe<void>();
});
