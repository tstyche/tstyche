import { expect, test } from "tstyche";

interface Sample {
  nested: Sample;
  optional?: string;
  required: number;
}

test("Partial", () => {
  expect<Partial<Sample>>().type.toMatch<{ nested?: Sample }>();
  expect<Partial<Sample>>().type.toMatch<{ optional?: string }>();
  expect<Partial<Sample>>().type.toMatch<{ required?: number }>();
});

test("Readonly", () => {
  expect<Readonly<Sample>>().type.toMatch<{ readonly nested: Sample }>();
  expect<Readonly<Sample>>().type.toMatch<{ readonly optional?: string }>();
  expect<Readonly<Sample>>().type.toMatch<{ readonly required: number }>();
});
