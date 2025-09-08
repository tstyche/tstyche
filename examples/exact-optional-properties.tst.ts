import { expect } from "tstyche";

// all four assertions pass only when '"exactOptionalPropertyTypes": true' is set

expect<{ a?: number }>().type.not.toBe<{ a?: number | undefined }>();
expect<{ a?: number | undefined }>().type.not.toBe<{ a?: number }>();

expect<{ a?: number | undefined }>().type.not.toBeAssignableTo<{ a?: number }>();
expect<{ a?: number }>().type.not.toBeAssignableFrom<{ a?: number | undefined }>();
