import { type _, expect, test } from "tstyche";

declare function readOption<T>(section: string): T | undefined;
declare function readOption<T>(section: string, defaultValue: T): T;

class Container<T> {
  private items: Array<T> = [];

  add(item: T): void {
    this.items.push(item);
  }
}

type Box<T = string> = {
  toArray: () => Array<T>;
};

test("allowed expressions", () => {
  expect(readOption).type.toBeInstantiableWith<[string]>();
  expect(Container).type.toBeInstantiableWith<[string]>();

  expect<Box>().type.toBeInstantiableWith<[string]>();
  expect(Container).type.toBeInstantiableWith<[string]>();
  expect<Container<_>>().type.toBeInstantiableWith<[string]>();
});
