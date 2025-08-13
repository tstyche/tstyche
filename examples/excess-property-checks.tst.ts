import { expect } from "tstyche";

let config: { timeout?: number } = {};

// @ts-expect-error Object literal may only specify known properties
config = { silent: true, timeout: 800 };

// Just like above, object literal may only specify known properties
expect({ silent: true, timeout: 800 }).type.not.toBeAssignableTo<{ timeout?: number }>();
expect<{ timeout?: number }>().type.not.toBeAssignableWith({ silent: true, timeout: 800 });

// But object types are allowed to have excess properties
expect<{ silent: true; timeout: 800 }>().type.toBeAssignableTo<{ timeout?: number }>();
expect<{ timeout?: number }>().type.toBeAssignableWith<{ silent: true; timeout: 800 }>();

// To get around, pass a reference instead of an object literal
const configSample = { silent: true, timeout: 800 };

expect(configSample).type.toBeAssignableTo<{ timeout?: number }>();
