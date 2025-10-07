import { expect, test } from "tstyche";

function isUint8Array(input: unknown): input is Uint8Array {
  return input instanceof Uint8Array;
}

test("isUint8Array", () => {
  const unknowns: Array<unknown> = [];

  // @tstyche if { target: ">=5.7" } -- Before TypeScript 5.7, 'Uint8Array' was not generic
  expect(unknowns.filter(isUint8Array)).type.toBe<Array<Uint8Array<ArrayBufferLike>>>();

  // @tstyche if { target: "<5.7" }
  expect(unknowns.filter(isUint8Array)).type.toBe<Array<Uint8Array>>();
});
