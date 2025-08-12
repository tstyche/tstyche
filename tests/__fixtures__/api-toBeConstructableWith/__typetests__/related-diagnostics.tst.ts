import { expect } from "tstyche";
import { Person as PersonExternal } from "./Person.js";

expect(PersonExternal).type.toBeConstructableWith({ name: "Alice", age: 32 });

expect(PersonExternal).type.toBeConstructableWith({ name: "John", age: false });

interface PersonOptions {
  name: string;
  age: number;
}

declare class Person {
  constructor(options: PersonOptions);
}

expect(Person).type.toBeConstructableWith({ name: "Alice", age: 32 });

expect(Person).type.toBeConstructableWith({ name: "John", age: false });
// @ts-expect-error This directive must be visible
new Person();
