---
name: tstyche-programmatic-api
description: Integrate TSTyche from JavaScript/TypeScript code, use the tag and API entrypoints, build custom reporters, consume events/results, or extend runner integrations safely.
---

# TSTyche programmatic API

Use this skill for `tstyche/tag`, `tstyche/api`, custom reporters, embedded runs, event handling, or code consuming TSTyche result/configuration types. Prefer the documented integration surface and verify signatures against built declarations before relying on a lower-level export.

## Choose the entrypoint

- Use `tstyche/tag` for an embedded run. Its default export is a tagged-template function; substitutions are stringified into command-line text. It resolves on a successful run and rejects when the CLI exit code is non-zero.
- Use `tstyche` for type-test source. The exported helpers and assertions are runtime no-ops, so importing them into a unit test does not execute type tests.
- Use `tstyche/api` for advanced integrations such as `Runner`, `Config`, reporters, events, result objects, output, store, diagnostics, and cancellation. Treat this as a broad API barrel: a symbol being exported does not by itself make it a stable high-level integration contract.

## Safe integration workflow

1. Read the programmatic reference and inspect `source/api.ts`, `source/tag.ts`, and the relevant public declaration/type file.
2. Give embedded runs an explicit `--root` and, when needed, `--config`, `--tsconfig`, `--target`, `--reporters`, and `--quiet` so they do not depend on the caller's working directory or TTY.
3. For custom reporters, export a default class with a constructor receiving `ResolvedConfig` and an `on(event)` method accepting `ReporterEvent`. Handle only events needed by the integration and keep output side effects intentional.
4. Subscribe to the typed event union and narrow event names before reading payloads. Always clean up or use the runner lifecycle so reporters/handlers do not leak between runs.
5. Test successful, failing, cancellation, missing-config, and custom-reporter paths. Assert both the returned/rejected behavior and any output contract the integration consumes.

## Read as needed

- Entry points and runner/tag patterns: [references/entrypoints-and-runner.md](references/entrypoints-and-runner.md)
- Reporter, event, and result contracts: [references/reporters-events-results.md](references/reporters-events-results.md)
- Config/CLI embedding and failure handling: [references/embedding-and-failures.md](references/embedding-and-failures.md)
