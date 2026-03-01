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
  "{ a: string } | { b: string }",
  ["{ a: string } | { b: number }", "{ a: string } | { b: number } | { b: number }"],
  [
    "({ a: string } | { b: number }) & ({ a: string } | { b: number })",
    "{ a: string } | { a: string; b: number } | { b: number }",
  ],

  // intersections

  ["{ a: string } & { b: string }", "{ a: string; b: string }"],
  ["{ a: string } & { b: number }", "{ a: string } & { a: string } & { b: number }"],
  ["((a: string) => string) & ((b: number) => number)", "{ (a: string): string; (b: number): number }"],
  "((b: number) => number) & ((a: string) => string)",

  // objects

  ["{ a: string }", "{ a: string } | { a: string }", "{ a: string } & { a: string }"],
  "{ a?: string }",
  "{ a?: string | undefined }",
  "{ readonly a: string }",
  "{ readonly a?: string }",
  "{ readonly a?: string | undefined }",

  // arrays

  "Array<string>",
  "Array<Array<string>>",
  "number[]",
  "ReadonlyArray<string>",
  "ReadonlyArray<ReadonlyArray<string>>",
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

  // signatures

  "() => void",
  "<T>() => T",
  "<T>(a: T) => T",
  "<T>(this: void) => T",
  "<const T>(a: T) => T",
  "<T>(a: NoInfer<T>) => T",
];

let testText = `import { expect, test } from "tstyche";
`;

for (const source of samples) {
  testText += `
test("is ${source}?", () => {
`;

  const sourceTypes = Array.isArray(source) ? source : [source];

  for (const sourceType of sourceTypes) {
    for (const targetType of sourceTypes) {
      testText += `  expect<${sourceType}>().type.toBe<${targetType}>();
`;
    }
  }

  testText += `});

test("is NOT ${source}?", () => {
`;

  for (const target of samples) {
    if (target === source) {
      continue;
    }

    const targetTypes = Array.isArray(target) ? target : [target];

    for (const targetType of targetTypes) {
      for (const sourceType of sourceTypes) {
        testText += `  expect<${sourceType}>().type.not.toBe<${targetType}>();
`;
      }
    }
  }

  testText += `});
`;
}

export default testText;
