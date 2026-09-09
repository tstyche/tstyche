---
name: tstyche-project-setup
description: Install, configure, run, and troubleshoot TSTyche projects, including test layout, TSConfig, CLI, TypeScript version matrices, templates, watch mode, environment, and CI.
---

# TSTyche project setup

Use this skill when adding TSTyche to a project, changing `tstyche.json` or TSConfig, selecting tests from the CLI, configuring CI/watch mode, or diagnosing environment/version/store behavior. Read the focused references only for the subsystem involved.

## Recommended setup

1. Install `tstyche` as a development dependency and keep TypeScript installed locally when the project has a preferred compiler version.
2. Put type tests in a dedicated `__typetests__` or `typetests` directory when possible. Give the directory an isolated TSConfig with `noEmit`, `strict`, `types: []`, an explicit include, and no accidental exclusion.
3. Add a `tstyche.json` only for intentional overrides. Use the local schema (`./node_modules/tstyche/schemas/config.json`) for editor validation and `--showConfig` to inspect the final result.
4. Run one focused file first, then the normal project command. Add a TypeScript target range to CI only when cross-version compatibility is part of the package contract.

## Non-obvious behavior

- CLI options override config-file options. Relative config paths are resolved from the config file; other selection paths are relative to the current working directory as documented.
- `testFileMatch` and `fixtureFileMatch` are case-insensitive glob lists. Brace expansion is supported; dot directories and `node_modules` require explicit patterns.
- `tsconfig` supports `findup` (default), `baseline`, a path, or inline JSON. A file not included in the selected TSConfig falls back to baseline compiler options.
- The default target `*` uses the installed TypeScript module and falls back to the latest available version. Store commands fetch/list/prune/update cached TypeScript packages.
- `--only` and `--skip` filter literal helper names case-insensitively; skip wins over only. `--watch` watches config and test files and depends on filesystem events.
- `checkDeclarationFiles`, `checkSuppressedErrors`, `rejectAnyType`, and `rejectNeverType` default to `true`; `reporters` defaults to `list,summary`; `failFast`, `quiet`, and `verbose` default to `false`.

## Read as needed

- Layout and compiler setup: [references/layout-and-tsconfig.md](references/layout-and-tsconfig.md)
- Config/schema options: [references/configuration.md](references/configuration.md)
- CLI, targets, store, and watch: [references/cli-and-versions.md](references/cli-and-versions.md)
- Environment variables and precedence: [references/environment.md](references/environment.md)
- Templates and CI: [references/templates-and-ci.md](references/templates-and-ci.md)
- Documentation/source coverage and ownership: [../sources.json](../sources.json)
