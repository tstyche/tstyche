import { expect, test } from "tstyche";

const isUint8Array = (input: unknown): input is Uint8Array => input instanceof Uint8Array;

test("isUint8Array", () => {
  const unknowns: ReadonlyArray<unknown> = [];

  // @tstyche if { target: [">=5.7"] }
  expect(unknowns.filter(isUint8Array)).type.toBe<Array<Uint8Array<ArrayBufferLike>>>();

  // @tstyche if { target: ["<5.7"] } -- Before TypeScript 5.7, 'Uint8Array' was not generic
  // Reference: https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/#typedarrays-are-now-generic-over-arraybufferlike
  expect(unknowns.filter(isUint8Array)).type.toBe<Array<Uint8Array>>();
});
