import assert from "node:assert";
import path from "node:path";
import test from "node:test";
import prettyAnsi from "pretty-ansi";
import { Scribbler, usesCompilerText } from "tstyche/tstyche";

const scribbler = new Scribbler();

test("usesCompilerText", async (t) => {
  await t.test("formats uses text of with discovered config", () => {
    const specifier = path.resolve("typetests", "tsconfig.json");

    const text = scribbler.render(usesCompilerText("5.3.4", { kind: 0, specifier }));

    assert.strictEqual(
      prettyAnsi(text),
      ["<blue>uses</> TypeScript 5.3.4<gray> with ./typetests/tsconfig.json</>", "", ""].join("\n"),
    );
  });

  await t.test("formats uses text of with default config", () => {
    const text = scribbler.render(usesCompilerText("5.3.4", { kind: 1, specifier: "baseline" }));

    assert.strictEqual(
      prettyAnsi(text),
      ["<blue>uses</> TypeScript 5.3.4<gray> with baseline TSConfig</>", "", ""].join("\n"),
    );
  });

  await t.test("formats uses text of with provided config", () => {
    const specifier = path.resolve("tsconfig.test.json");

    const text = scribbler.render(usesCompilerText("5.3.4", { kind: 2, specifier }));

    assert.strictEqual(
      prettyAnsi(text),
      ["<blue>uses</> TypeScript 5.3.4<gray> with ./tsconfig.test.json</>", "", ""].join("\n"),
    );
  });

  await t.test("formats uses text of with inline config", () => {
    const specifier = path.resolve("typetests", "3k47kg76.test.json");

    const text = scribbler.render(usesCompilerText("5.3.4", { kind: 3, specifier }));

    assert.strictEqual(
      prettyAnsi(text),
      ["<blue>uses</> TypeScript 5.3.4<gray> with inline TSConfig</>", "", ""].join("\n"),
    );
  });

  await t.test("formats uses short text", () => {
    const specifier = path.resolve("typetests", "tsconfig.json");

    const text = scribbler.render(usesCompilerText("5.3.4", { kind: 0, specifier }, { short: true }));

    assert.strictEqual(prettyAnsi(text), "<blue>5.3.4</>");
  });
});
