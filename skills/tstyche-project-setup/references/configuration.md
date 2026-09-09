# Configuration file and schema

The live reference is https://tstyche.org/reference/config-file. The checked-in schema is `schemas/config.json`; declarations are in `source/config/types.ts` and defaults in `source/config/defaultOptions.ts`.

## Shape and precedence

Create `tstyche.json` at the project root, or use `--config`. The file accepts JSON plus comments, unquoted keys, single quotes, and trailing commas. Add `"$schema": "./node_modules/tstyche/schemas/config.json"` for editor validation. Command-line values override file values; unspecified values use defaults.

## Config-file options

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `checkDeclarationFiles` | boolean | `true` | check project `.d.ts` files |
| `checkSuppressedErrors` | boolean | `true` | verify `@ts-expect-error` diagnostics |
| `failFast` | boolean | `false` | stop after first failed assertion |
| `fixtureFileMatch` | string[] | `**/__fixtures__/*.{ts,tsx}`, `**/fixtures/*.{ts,tsx}` | fixture globs |
| `quiet` | boolean | `false` | suppress normal output |
| `rejectAnyType` | boolean | `true` | reject inferred `any` inputs |
| `rejectNeverType` | boolean | `true` | reject inferred `never` inputs |
| `reporters` | string[] | `list`, `summary` | reporter names/modules |
| `target` | string[] in API, string in JSON schema | `*` | TypeScript versions/ranges |
| `testFileMatch` | string[] | `**/*.tst.*`, `**/__typetests__/*.test.*`, `**/typetests/*.test.*` | test globs |
| `tsconfig` | string | `findup` | compiler config mode/path/inline JSON |
| `verbose` | boolean | `false` | detailed logging |

The source declarations expose `target` as `Array<string>` after parsing while the config schema accepts a string. Follow the schema for user-authored JSON and the declarations for programmatic `ConfigFileOptions`.

Use `--showConfig` to debug path resolution and merged defaults. Do not document removed names such as `rootPath` or the old `ignore` TSConfig mode as current options.
