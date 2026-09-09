# TSTyche Agent Skills

These repository-local skills help an AI agent work with TSTyche's type-test,
project-setup, and programmatic-integration surfaces.

## Skill map

- `tstyche-type-tests`: assertions, helpers, directives, inference, and
  TypeScript compatibility.
- `tstyche-project-setup`: installation, layout, configuration, CLI, store,
  environment, watch mode, templates, and CI.
- `tstyche-programmatic-api`: `tstyche/tag`, `tstyche/api`, runners,
  reporters, events, results, cancellation, and embedded runs.

Each skill has a short `SKILL.md` entrypoint and focused Markdown references.
The source and ownership map is [sources.json](sources.json).

## Maintenance workflow

Build the package before checking the skills because the synchronization
snapshot is based on the published declaration files and CLI help:

```shell
aube build
npm run skills:check
```

When a contract changes, update the owning skill and `skills/sources.json`,
then run:

```shell
npm run skills:update
npm run skills:check
```

The updater refreshes the deterministic surface snapshot and the package
version recorded in `sources.json`. It refuses to write when skill or manifest
validation fails.
