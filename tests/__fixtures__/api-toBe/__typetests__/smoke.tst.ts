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

  // unions

  "string | number",
  "string | Array<string>",
  "string | Array<{ a: string }>",

  // objects

  "{ a: string }",
  "{ a?: string }",
  "{ readonly a: string }",
  "{ readonly a?: string }",

  // arrays

  "Array<string>",
  "number[]",
  "ReadonlyArray<string>",
  "Array<{ a: string }>",
  "{ a: number }[]",
  "ReadonlyArray<{ a: string }>",
  "{ readonly a: Array<string> }",
  "{ readonly a: number[] }",
  "{ readonly a: ReadonlyArray<string> }",

  // tuples

  "[string]",
  "[number]",
  "[string?]",
  "readonly [string]",
  "readonly [string?]",

  // references

  "Promise<number>",
  "Promise<void>",
  "Promise<{ a: string }>",
  "Promise<Array<{ a: string }>>",
  "Promise<ReadonlyArray<{ a: string }>>",
];

let testText = `import { expect, test } from "tstyche";
`;

for (const sourceType of samples) {
  testText += `
test("is ${sourceType}?", () => {
  expect<${sourceType}>().type.toBe<${sourceType}>();

`;

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
});
`;
}

export default testText;
