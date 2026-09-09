# Embedding, configuration, and failures

Use explicit configuration when embedding TSTyche in a unit test, build tool, or fixture harness. The live overview is https://tstyche.org/guides/programmatic-usage and the CLI contract is https://tstyche.org/reference/command-line.

## Isolate the run

- Set `--root` to the fixture/project URL or path; set `--config` if the config is outside that root.
- Set `--quiet` when the host test should own output, and set `--reporters` explicitly when parsing reporter output.
- Set `--tsconfig` and `--target` when host-project discovery could select the wrong compiler settings or TypeScript version.
- Use an explicit temporary `TSTYCHE_STORE_PATH` for tests that fetch TypeScript versions; avoid sharing mutable stores across concurrent fixtures.

## Failure paths

The tagged API rejects on non-zero CLI exit, including test failures and configuration/selection errors. Catch the error at the host boundary and preserve stdout/stderr if diagnostics are part of the assertion. `Runner.run` itself resolves after dispatching events; inspect result/event state or use `Cli` when a process-like exit code is required.

For cancellation, pass a `CancellationToken` to `Runner.run` and test the cancellation reason. Ensure a watch run is cancelled by the host test; otherwise its async iterator can keep the process alive.

For custom reporters, test module resolution for a package and a relative file, default-export shape, event narrowing, and cleanup across two sequential runs. Keep reporter code compatible with the package's ESM exports.
