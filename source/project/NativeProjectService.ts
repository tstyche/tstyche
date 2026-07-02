import type * as tsApi from "typescript/unstable/sync";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { ProjectConfigKind } from "#result";
import type { NativeTypeScript } from "#typescript";
import { BaseProjectService } from "./BaseProjectService.js";

export class NativeProjectService extends BaseProjectService {
  #api: InstanceType<NativeTypeScript["API"]>;
  #lastSeenProject: tsApi.Project | undefined;
  #ts: NativeTypeScript;

  // TODO must have instance of 'vfs'

  constructor(ts: NativeTypeScript, resolvedConfig: ResolvedConfig) {
    super(resolvedConfig);

    this.#ts = ts;

    this.#api = new ts.API();
  }

  close(): void {
    this.#api.close();
  }

  closeFile(filePath: string): void {
    this.#api.updateSnapshot({ closeFiles: [filePath] });
  }

  getProject(filePath: string): tsApi.Project {
    let snapshot: tsApi.Snapshot;
    let project: tsApi.Project | undefined;

    switch (this.projectConfig.kind) {
      case ProjectConfigKind.Discovered:
        break;

      case ProjectConfigKind.Provided:
      case ProjectConfigKind.Synthetic:
        snapshot = this.#api.updateSnapshot({ openProjects: [this.projectConfig.specifier] });
        project = snapshot.getDefaultProjectForFile(filePath);

        break;

      case ProjectConfigKind.Default:
        // TODO try handling through 'vfs' by returning undefined

        break;
    }

    if (project) {
      return project;
    }

    snapshot = this.#api.updateSnapshot({ openFiles: [filePath] });

    return snapshot.getDefaultProjectForFile(filePath)!;
  }

  openFile(filePath: string): void {
    const project = this.getProject(filePath);

    if (project !== this.#lastSeenProject) {
      this.#lastSeenProject?.dispose();
      this.#lastSeenProject = project;

      const projectConfig =
        // TODO waiting for: https://github.com/microsoft/typescript-go/issues/4519
        project.configFileName !== "/dev/null/inferred"
          ? { ...this.projectConfig, specifier: project.configFileName }
          : { kind: ProjectConfigKind.Default, specifier: "baseline" };

      EventEmitter.dispatch(["project:uses", { compilerVersion: this.#ts.version, projectConfig }]);

      const configFileParsingDiagnostics = project.program.getConfigFileParsingDiagnostics();

      if (configFileParsingDiagnostics.length > 0) {
        EventEmitter.dispatch([
          "project:error",
          // @ts-expect-error TODO handle native diagnostics
          { diagnostics: Diagnostic.fromDiagnostics(configFileParsingDiagnostics) },
        ]);
      }
    }
  }
}
