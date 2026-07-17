import { existsSync } from "node:fs";
import type * as tsApi from "typescript/unstable/sync";
import type { ResolvedConfig } from "#config";
import { Path } from "#path";

interface ProjectReference {
  path: string;
  originalPath?: string;
  circular?: boolean;
}

interface ParsedConfig {
  options: Record<string, unknown>;
  fileNames: Array<string>;
  projectReferences?: Array<ProjectReference> | undefined;
}

export class ProjectConfigService {
  #api: InstanceType<typeof tsApi.API>;
  #configCache = new Map<string, ParsedConfig>();
  #resolvedConfig: ResolvedConfig;

  constructor(api: InstanceType<typeof tsApi.API>, resolvedConfig: ResolvedConfig) {
    this.#api = api;
    this.#resolvedConfig = resolvedConfig;
  }

  findUp(filePath: string, currentPath = Path.dirname(filePath)): string | undefined {
    const configPath = this.#resolveConfigPath(filePath, currentPath);

    if (configPath) {
      return configPath;
    }

    if (currentPath === this.#resolvedConfig.rootPath) {
      return;
    }

    const parentPath = Path.dirname(currentPath);

    if (parentPath === currentPath) {
      return;
    }

    return this.findUp(filePath, parentPath);
  }

  #resolveConfigPath(filePath: string, currentPath: string): string | undefined {
    for (const configName of ["tsconfig.json", "jsconfig.json"]) {
      const probePath = Path.join(currentPath, configName);
      const config = this.#getParsedConfig(probePath);

      if (!config) {
        continue;
      }

      if (config.fileNames.includes(filePath)) {
        return probePath;
      }

      const result = this.#resolveInProjectReferences(filePath, config, new Set());

      if (result) {
        return result;
      }
    }

    return;
  }

  #getParsedConfig(filePath: string): ParsedConfig | undefined {
    let config = this.#configCache.get(filePath);

    if (!config) {
      if (!existsSync(filePath)) {
        return;
      }

      config = this.#api.parseConfigFile(filePath);
      this.#configCache.set(filePath, config);
    }

    return config;
  }

  #resolveInProjectReferences(filePath: string, config: ParsedConfig, visited: Set<string>): string | undefined {
    if (!config.projectReferences) {
      return;
    }

    for (const projectReference of config.projectReferences) {
      if (visited.has(projectReference.path)) {
        continue; // skip circular references
      }

      const config = this.#getParsedConfig(projectReference.path);

      if (!config) {
        continue;
      }

      if (config.fileNames.includes(filePath)) {
        return projectReference.path;
      }

      visited.add(projectReference.path);

      // walk nested references
      const configPath = this.#resolveInProjectReferences(filePath, config, visited);

      if (configPath) {
        return configPath;
      }
    }

    return;
  }
}
