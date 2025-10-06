import { expect, test } from "tstyche";

type Newable<T extends abstract new (...args: any) => any> = {
  new (...args: ConstructorParameters<T>): InstanceType<T>;
};

declare class Person {
  constructor(name: string, age: number);
}

test("PersonConstructor", () => {
  expect<Newable<typeof Person>>().type.toBeConstructableWith("Alice", 30);

  expect<Newable<typeof Person>>().type.not.toBeConstructableWith("Alice");
});
