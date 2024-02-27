import { strict as assert } from "node:assert";
import { describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import { Scribbler, testNameText } from "tstyche/tstyche";

const scribbler = new Scribbler();

describe("testNameText", function() {
  test("formats failing test name text", function() {
    const text = scribbler.render(testNameText("fail", "sample test name"));

    assert.equal(
      prettyAnsi(text),
      [
        "  <red>×</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats failing test name text with indent", function() {
    const text = scribbler.render(testNameText("fail", "sample test name", 2));

    assert.equal(
      prettyAnsi(text),
      [
        "      <red>×</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats passing test name text", function() {
    const text = scribbler.render(testNameText("pass", "sample test name"));

    assert.equal(
      prettyAnsi(text),
      [
        "  <green>+</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats passing test name text with indent", function() {
    const text = scribbler.render(testNameText("pass", "sample test name", 2));

    assert.equal(
      prettyAnsi(text),
      [
        "      <green>+</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats skipped test name text", function() {
    const text = scribbler.render(testNameText("skip", "sample test name"));

    assert.equal(
      prettyAnsi(text),
      [
        "  <yellow>- skip</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats skipped test name text with indent", function() {
    const text = scribbler.render(testNameText("skip", "sample test name", 2));

    assert.equal(
      prettyAnsi(text),
      [
        "      <yellow>- skip</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats todo test name text", function() {
    const text = scribbler.render(testNameText("todo", "sample test name"));

    assert.equal(
      prettyAnsi(text),
      [
        "  <magenta>- todo</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });

  test("formats todo test name text with indent", function() {
    const text = scribbler.render(testNameText("todo", "sample test name", 2));

    assert.equal(
      prettyAnsi(text),
      [
        "      <magenta>- todo</> <gray>sample test name</>",
        "",
      ].join("\n"),
    );
  });
});
