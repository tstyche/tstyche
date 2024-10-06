import { expect, omit, pick, test } from "tstyche";

interface Sample {
  nested: Sample;
  optional?: string;
  required: number;
}

declare const sample: Sample;

test("sample", () => {
  expect(pick(sample, "nested")).type.toBe<{ nested: Sample }>();
  expect(pick(sample, "optional")).type.toBe<{ optional?: string }>();
  expect(pick(sample, "required")).type.toBe<{ required: number }>();

  expect(omit(sample, "nested")).type.toBe<{ optional?: string; required: number }>();
});

declare const partialSample: Partial<Sample>;

test("partialSample", () => {
  expect(pick(partialSample, "nested")).type.toBe<{ nested?: Sample }>();
  expect(pick(partialSample, "optional")).type.toBe<{ optional?: string }>();
  expect(pick(partialSample, "required")).type.toBe<{ required?: number }>();

  expect(omit(partialSample, "nested")).type.toBe<{ optional?: string; required?: number }>();
});

declare const readonlySample: Readonly<Sample>;

test("readonlySample", () => {
  expect(pick(readonlySample, "nested")).type.toBe<{ readonly nested: Sample }>();
  expect(pick(readonlySample, "optional")).type.toBe<{ readonly optional?: string }>();
  expect(pick(readonlySample, "required")).type.toBe<{ readonly required: number }>();

  expect(omit(readonlySample, "nested")).type.toBe<{ readonly optional?: string; readonly required: number }>();
});
