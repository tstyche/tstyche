# Reporters, events, and results

The live reporter guide is https://tstyche.org/guides/reporters. Source authorities are `source/reporters/types.ts`, `source/events/types.ts`, and `source/result/types.ts`.

## Custom reporter

```js
export default class Reporter {
  constructor(resolvedConfig) {
    this.resolvedConfig = resolvedConfig;
  }

  on([event, payload]) {
    if (event === "run:start") {
      for (const file of payload.result.files) console.log(file.path);
    }
  }
}
```

Configure it by package name or local path in `reporters`. Builtins are `dot`, `list`, and `summary`; the default is `list,summary`. A reporter must implement `on`; its constructor receives `ResolvedConfig`.

## Event typing

`Event` includes config/select/store errors, run/target/project/file lifecycle, directive/collection/test/expect lifecycle, suppressed-error outcomes, and watch errors. `ReporterEvent` excludes `config:error` and `select:error`; a reporter should not assume those payloads are available. Narrow the tuple's event name before using payload fields.

## Result typing

Result types include `Result`, `TargetResult`, `ProjectResult`, `FileResult`, `DescribeResult`, `TestResult`, `ExpectResult`, and `SuppressedResult`, with `ResultStatus`, counts, timing, and project-config types. Consume documented fields such as `files`, each file's `path`, status/counts, and timing only after checking the declaration for the package version in use.

When a reporter needs diagnostics, handle the corresponding `*:error` event and its typed diagnostics array. Do not infer process exit status from an individual pass/fail event; let `Cli`/runner completion determine overall success.
