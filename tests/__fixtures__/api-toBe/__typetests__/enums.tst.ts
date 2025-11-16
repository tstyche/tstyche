import { expect, test } from "tstyche";

enum Horizontal {
  Left = "left",
  Right = "right",
}

enum Vertical {
  Up,
  Down,
}

enum Choice {
  Yes,
  No,
}

test("is string enum?", () => {
  expect<Horizontal.Left>().type.toBe<Horizontal.Left>();

  expect<Horizontal.Left>().type.not.toBe<Horizontal.Right>();
  expect<Horizontal.Left>().type.not.toBe<"left">();
  expect<Horizontal.Left>().type.not.toBe<string>();
});

test("is numeric enum?", () => {
  expect<Vertical.Up>().type.toBe<Vertical.Up>();

  expect<Vertical.Up>().type.not.toBe<Vertical.Down>();
  expect<Vertical.Up>().type.not.toBe<0>();
  expect<Vertical.Up>().type.not.toBe<number>();
  expect<Vertical.Up>().type.not.toBe<Choice.Yes>();
});

test("enum literal is the same as the union of its values", () => {
  expect<Horizontal>().type.toBe<(typeof Horizontal)[keyof typeof Horizontal]>();
  expect<Horizontal>().type.toBe<Horizontal.Left | Horizontal.Right>();
  expect<Horizontal.Left | Horizontal.Right>().type.toBe<Horizontal>();

  expect<Vertical>().type.not.toBe<Vertical.Up | 1>();
  expect<Vertical>().type.not.toBe<Vertical.Up | number>();
  expect<Vertical>().type.not.toBe<Vertical.Up | Choice.No>();
  expect<Vertical>().type.not.toBe<Choice.Yes | Choice.No>();

  expect<Vertical.Up | 1>().type.not.toBe<Vertical>();
  expect<Vertical.Up | number>().type.not.toBe<Vertical>();
  expect<Vertical.Up | Choice.No>().type.not.toBe<Vertical>();
  expect<Choice.Yes | Choice.No>().type.not.toBe<Vertical>();
});
