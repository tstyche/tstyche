// @tstyche template

const samples = [
  "any",
  "unknown",
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "object",
  "void",
  "undefined",
  "null",
  "never",

  // literals

  "'abc'",
  "'def'",
  "123",
  "456",
  "887n",
  "998n",
  "true",
  "false",

  // arrays

  "Array<string>",
  "number[]",
];

// TODO
// expect<string>().type.not.toBe<Array<{ a: string }>>();
// expect<string>().type.not.toBe<[string]>();
// expect<string>().type.not.toBe<{ a: string }>();
// expect<string>().type.not.toBe<Promise<string>>();

let testText = `import { expect, test } from "tstyche";
`;

for (const sourceType of samples) {
  testText += `
test("is ${sourceType}?", () => {
  expect<${sourceType}>().type.toBe<${sourceType}>();

`;

  for (const targetType of samples) {
    if (targetType === sourceType) {
      continue;
    }

    testText += `  expect<${sourceType}>().type.toBe<${targetType}>(); // fail
`;
  }

  testText += `});

test("is NOT ${sourceType}?", () => {
`;

  for (const targetType of samples) {
    if (targetType === sourceType) {
      continue;
    }

    testText += `  expect<${sourceType}>().type.not.toBe<${targetType}>();
`;
  }

  testText += `
  expect<${sourceType}>().type.not.toBe<${sourceType}>(); // fail
});
`;
}

export default testText;
