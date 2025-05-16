//this generates tests
//@tstyche-template

let testText = `
import { expect, test } from "tstyche";
`;

for (const target of ["string", "number"]) {
  testText += `test("is ${target} a string?", () => {
  expect<string>().type.toBe<${target}>();
});
`;
}

export default testText;
