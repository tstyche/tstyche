// @tstyche-template

let testText = `import { expect, test } from "tstyche";
`;

for (const typeText of ["string", "number"]) {
  testText += `test("is ${typeText} a ${typeText}?", () => {
  expect<${typeText}>().type.toBe<${typeText}>();
});
`;
}

export default testText;
