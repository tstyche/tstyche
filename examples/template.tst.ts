// @tstyche template -- For documentation, see: https://tstyche.org/guide/template-test-files

let testText = `
import { expect, test } from "tstyche";
`;

for (const typeText of ["string", "number"]) {
  testText += `test("is ${typeText} a ${typeText}?", () => {
  expect<${typeText}>().type.toBe<${typeText}>();
});
`;
}

export default testText;
