import { Options, type ResolvedConfig } from "#config";
import { Path } from "#path";
import { type ProjectConfig, ProjectConfigKind } from "#result";

export abstract class BaseProjectService {
  protected projectConfig: ProjectConfig;

  constructor(resolvedConfig: ResolvedConfig) {
    this.projectConfig = this.#resolveProjectConfig(resolvedConfig);
  }

  #resolveProjectConfig(resolvedConfig: ResolvedConfig): ProjectConfig {
    if (resolvedConfig.tsconfig === "baseline") {
      return { kind: ProjectConfigKind.Default, specifier: "baseline" };
    }

    if (resolvedConfig.tsconfig === "findup") {
      return { kind: ProjectConfigKind.Discovered, specifier: "" };
    }

    if (Options.isJsonString(resolvedConfig.tsconfig)) {
      return {
        kind: ProjectConfigKind.Synthetic,
        specifier: Path.resolve(resolvedConfig.rootPath, `${Date.now().toString(36)}.tsconfig.json`),
      };
    }

    return { kind: ProjectConfigKind.Provided, specifier: resolvedConfig.tsconfig };
  }
}
