import { expect } from "tstyche";

// all four assertion pass only when '"exactOptionalPropertyTypes": true' is set

expect<{ a?: number }>().type.not.toBe<{ a?: number | undefined }>();
expect<{ a?: number | undefined }>().type.not.toBe<{ a?: number }>();

expect<{ a?: number }>().type.not.toBeAssignableWith<{
  a?: number | undefined;
}>();
expect<{ a?: number | undefined }>().type.not.toBeAssignableTo<{
  a?: number;
}>();
