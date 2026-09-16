# Environment variables

The live reference is https://tstyche.org/reference/environment. The source authority is `source/environment/Environment.ts`; use it when names or aliases differ from the website.

Values are not validated by TSTyche: booleans are true for any non-empty value, numbers use numeric parsing, and strings pass through. `--showConfig` does not display every environment-only detail, so inspect the process environment when diagnosing store/network behavior.

| Variable | Current source behavior |
| --- | --- |
| `TSTYCHE_FETCH_RETRIES` | numeric retry count; default `2` |
| `TSTYCHE_FETCH_TIMEOUT` | numeric seconds; default `30` |
| `TSTYCHE_TIMEOUT` | legacy timeout alias used when `TSTYCHE_FETCH_TIMEOUT` is absent |
| `TSTYCHE_NO_COLOR` | non-empty disables color; `NO_COLOR` is fallback |
| `TSTYCHE_NO_INTERACTIVE` | non-empty disables interactive output; otherwise based on TTY |
| `TSTYCHE_NPM_REGISTRY` | registry base URL; default npm registry |
| `TSTYCHE_STORE_PATH` | cache directory, resolved to an absolute path |
| `TSTYCHE_TYPESCRIPT_MODULE` | module/path for the active TypeScript implementation |
| `CI` | non-empty marks CI mode |

Store defaults vary by platform and `XDG_DATA_HOME`/`LocalAppData`. Keep CI deterministic by setting a writable store path and disabling interactive/color output where needed.

The source retains `TSTYCHE_TIMEOUT` as a legacy fallback, while the website documents the more specific fetch variables. Treat this as compatibility-sensitive and update the skill when source behavior changes.
