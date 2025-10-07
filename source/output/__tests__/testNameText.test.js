import assert from "node:assert";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { ResultStatus, Scribbler, testNameText } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("testNameText", async (t) => {
  await t.test("formats passing test name text", () => {
    const text = scribbler.render(testNameText(ResultStatus.Passed, "sample test name"));

    assert.strictEqual(prettyAnsi(text), ["  <green>+</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats passing test name text with indent", () => {
    const text = scribbler.render(testNameText(ResultStatus.Passed, "sample test name", 2));

    assert.strictEqual(prettyAnsi(text), ["      <green>+</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats failing test name text", () => {
    const text = scribbler.render(testNameText(ResultStatus.Failed, "sample test name"));

    assert.strictEqual(prettyAnsi(text), ["  <red>×</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats failing test name text with indent", () => {
    const text = scribbler.render(testNameText(ResultStatus.Failed, "sample test name", 2));

    assert.strictEqual(prettyAnsi(text), ["      <red>×</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats fixme test name text", () => {
    const text = scribbler.render(testNameText(ResultStatus.Fixme, "sample test name"));

    assert.strictEqual(prettyAnsi(text), ["  <yellow>- fixme</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats fixme test name text with indent", () => {
    const text = scribbler.render(testNameText(ResultStatus.Fixme, "sample test name", 2));

    assert.strictEqual(prettyAnsi(text), ["      <yellow>- fixme</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats skipped test name text", () => {
    const text = scribbler.render(testNameText(ResultStatus.Skipped, "sample test name"));

    assert.strictEqual(prettyAnsi(text), ["  <yellow>- skip</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats skipped test name text with indent", () => {
    const text = scribbler.render(testNameText(ResultStatus.Skipped, "sample test name", 2));

    assert.strictEqual(prettyAnsi(text), ["      <yellow>- skip</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats todo test name text", () => {
    const text = scribbler.render(testNameText(ResultStatus.Todo, "sample test name"));

    assert.strictEqual(prettyAnsi(text), ["  <magenta>- todo</> <gray>sample test name</>", ""].join("\n"));
  });

  await t.test("formats todo test name text with indent", () => {
    const text = scribbler.render(testNameText(ResultStatus.Todo, "sample test name", 2));

    assert.strictEqual(prettyAnsi(text), ["      <magenta>- todo</> <gray>sample test name</>", ""].join("\n"));
  });
});
