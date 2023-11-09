import { describe, expect, test } from "@jest/globals";
import ansiEscapesSerializer from "jest-serializer-ansi-escapes";
import { Scribbler } from "../../Scribbler.js";
import { testNameText } from "../testNameText.js";

expect.addSnapshotSerializer(ansiEscapesSerializer);

const scribbler = new Scribbler();

describe("testNameText", () => {
  test("formats failing test name text", () => {
    const text = scribbler.render(testNameText("fail", "sample test name"));

    expect(text).toMatchInlineSnapshot(`
      "  <red>×</> <gray>sample test name</>
      "
    `);
  });

  test("formats failing test name text with indent", () => {
    const text = scribbler.render(testNameText("fail", "sample test name", 2));

    expect(text).toMatchInlineSnapshot(`
      "      <red>×</> <gray>sample test name</>
      "
    `);
  });

  test("formats passing test name text", () => {
    const text = scribbler.render(testNameText("pass", "sample test name"));

    expect(text).toMatchInlineSnapshot(`
      "  <green>+</> <gray>sample test name</>
      "
    `);
  });

  test("formats passing test name text with indent", () => {
    const text = scribbler.render(testNameText("pass", "sample test name", 2));

    expect(text).toMatchInlineSnapshot(`
      "      <green>+</> <gray>sample test name</>
      "
    `);
  });

  test("formats skipped test name text", () => {
    const text = scribbler.render(testNameText("skip", "sample test name"));

    expect(text).toMatchInlineSnapshot(`
      "  <yellow>- skip</> <gray>sample test name</>
      "
    `);
  });

  test("formats skipped test name text with indent", () => {
    const text = scribbler.render(testNameText("skip", "sample test name", 2));

    expect(text).toMatchInlineSnapshot(`
      "      <yellow>- skip</> <gray>sample test name</>
      "
    `);
  });

  test("formats todo test name text", () => {
    const text = scribbler.render(testNameText("todo", "sample test name"));

    expect(text).toMatchInlineSnapshot(`
      "  <magenta>- todo</> <gray>sample test name</>
      "
    `);
  });

  test("formats todo test name text with indent", () => {
    const text = scribbler.render(testNameText("todo", "sample test name", 2));

    expect(text).toMatchInlineSnapshot(`
      "      <magenta>- todo</> <gray>sample test name</>
      "
    `);
  });
});
