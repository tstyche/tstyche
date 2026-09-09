# CLI, TypeScript versions, store, and watch

The live references are https://tstyche.org/reference/command-line and https://tstyche.org/guides/typescript-versions.

## Selection and control

Without arguments, the CLI runs files matched by `testFileMatch`. Positional search strings select matching relative paths. Use `--listFiles` to verify selection and `--showConfig` to verify the resolved config.

Options are `--config`, `--failFast`, `--fetch`, `--help`, `--list`, `--listFiles`, `--only`, `--prune`, `--quiet`, `--reporters`, `--root`, `--showConfig`, `--skip`, `--target`, `--tsconfig`, `--update`, `--verbose`, `--version`, and `--watch`.

`--reporters` is a comma-separated list of `dot`, `list`, `summary`, package names, or local module paths. Boolean options accept omitted/`true`/`false` forms. `--fetch` requires or uses a target selection; `--update` refreshes TypeScript registry metadata; `--prune` removes cached versions.

## Targets

Use an exact patch (`5.8.2`), minor series (`5.8`), distribution tag (`beta`, `latest`, `next`, `rc`), OR-separated selectors, or a minor-version range (`>=5.6`, `>=5.4 <5.6`). TSTyche supports TypeScript `>=5.4`, but TypeScript 7 is not currently supported; open-ended ranges have the same implicit upper bound as the supported store, currently `6.0`. Use `--target` with one version while diagnosing a range failure.

For changed built-in declarations, gate only the affected assertions with `// @tstyche if { target: ... }`. In CI, a range tests each supported minor series and newly released versions; this is slower than local single-version runs.

## TSConfig and watch

`--tsconfig` accepts `findup`, `baseline`, a path, or inline JSON. `--root` constrains file discovery and config lookup; pair it with an explicit `--config` when the config lives elsewhere. Watch mode observes config and test files recursively through filesystem events and reruns related tests.
