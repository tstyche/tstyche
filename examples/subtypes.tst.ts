import { expect, omit, pick } from "tstyche";

interface Sample {
  deepNested: Sample;
  optional?: string;
  required: number;
}

declare const sample: Sample;

expect(omit(sample, "deepNested")).type.toBe<{ optional?: string; required: number }>();

// Equivalent to the `Omit` utility type
expect<Omit<Sample, "deepNested">>().type.toBe<{ optional?: string; required: number }>();

class Queue {
  readonly size: number;

  constructor() {
    this.size = 0;
  }
}

expect(pick(new Queue(), "size")).type.toBe<{ readonly size: number }>();

// Equivalent to the `Pick` utility type
expect<Pick<Queue, "size">>().type.toBe<{ readonly size: number }>();
