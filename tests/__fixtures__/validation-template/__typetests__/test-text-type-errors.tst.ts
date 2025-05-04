// @tstyche-template

let testText = `
import { expect, test } from "tstyche";
`;

for (const target of ["string", "number"]) {
  testText += `test("is ${target} a string?", () => {
  expect<string>().toBe<${target}>();
});
`;
}

export default testText;
