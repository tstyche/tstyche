import { expect } from "tstyche";

interface Matchers<R, T = unknown> {
  [key: string]: (expected: T) => R;
}

expect<Matchers<void, string>>().type.not.toRaiseError();

expect<Matchers<void>>().type.not.toRaiseError();

// Substring of the error message
expect(() => {
  type E = Matchers;
}).type.toRaiseError("requires between 1 and 2 type arguments");

// The error code
expect(() => {
  type E = Matchers;
}).type.toRaiseError(2707);

// Pattern matching the error message
expect(() => {
  type E = Matchers;
}).type.toRaiseError(/between \d and \d type arguments/);
expect(() => {
  type E = Matchers;
}).type.toRaiseError(/generic .+ requires .+ type arguments/i);

// The exact error message
expect(() => {
  type E = Matchers;
}).type.toRaiseError(/^Generic type 'Matchers<R, T>' requires between 1 and 2 type arguments.$/);
