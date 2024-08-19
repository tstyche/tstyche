import { expect } from "tstyche";

// Object literals may only specify known properties
expect.fail<{ timeout?: number }>().type.toBeAssignableWith({ silent: true, timeout: 800 });
expect.fail({ silent: true, timeout: 800 }).type.toBeAssignableTo<{ timeout?: number }>();

// But object types are allowed to have excess properties
expect<{ timeout?: number }>().type.toBeAssignableWith<{ silent: true; timeout: 800 }>();
expect<{ silent: true; timeout: 800 }>().type.toBeAssignableTo<{ timeout?: number }>();

// To get around, pass a reference instead of an object literal
const configSample = { silent: true, timeout: 800 };

expect<{ timeout?: number }>().type.toBeAssignableWith(configSample);
expect(configSample).type.toBeAssignableTo<{ timeout?: number }>();
