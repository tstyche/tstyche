// @tstyche-template

let testText = `import { expect, test } from "tstyche";
`;

for (const source of ["string", "number"]) {
  testText += `test("is ${source} a string?", () => {
  expect<${source}>().type.toBe<string>();
});
`;
}

export default testText;
