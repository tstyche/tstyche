import { expect } from "chai";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { Scribbler, testNameText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("testNameText", () => {
  test("formats failing test name text", () => {
    const text = scribbler.render(testNameText("fail", "sample test name"));

    expect(prettyAnsi(text)).to.equal([
      "  <red>×</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats failing test name text with indent", () => {
    const text = scribbler.render(testNameText("fail", "sample test name", 2));

    expect(prettyAnsi(text)).to.equal([
      "      <red>×</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats passing test name text", () => {
    const text = scribbler.render(testNameText("pass", "sample test name"));

    expect(prettyAnsi(text)).to.equal([
      "  <green>+</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats passing test name text with indent", () => {
    const text = scribbler.render(testNameText("pass", "sample test name", 2));

    expect(prettyAnsi(text)).to.equal([
      "      <green>+</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats skipped test name text", () => {
    const text = scribbler.render(testNameText("skip", "sample test name"));

    expect(prettyAnsi(text)).to.equal([
      "  <yellow>- skip</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats skipped test name text with indent", () => {
    const text = scribbler.render(testNameText("skip", "sample test name", 2));

    expect(prettyAnsi(text)).to.equal([
      "      <yellow>- skip</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats todo test name text", () => {
    const text = scribbler.render(testNameText("todo", "sample test name"));

    expect(prettyAnsi(text)).to.equal([
      "  <magenta>- todo</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });

  test("formats todo test name text with indent", () => {
    const text = scribbler.render(testNameText("todo", "sample test name", 2));

    expect(prettyAnsi(text)).to.equal([
      "      <magenta>- todo</> <gray>sample test name</>",
      "",
    ].join("\n"));
  });
});
