import type * as tsApi from "typescript/unstable/sync";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { ProjectConfigKind } from "#result";
import type { NativeTypeScript } from "#typescript";
import { BaseProjectService } from "./BaseProjectService.js";
import type { FileSystem } from "./types.js";

export class NativeProjectService extends BaseProjectService {
  #api: InstanceType<NativeTypeScript["API"]>;
  #lastSeenProject: tsApi.Project | undefined;
  #ts: NativeTypeScript;

  constructor(ts: NativeTypeScript, resolvedConfig: ResolvedConfig) {
    super(resolvedConfig);

    this.#ts = ts;

    const fs: FileSystem = {};

    if (this.projectConfig.kind >= ProjectConfigKind.Default) {
      fs.fileExists = (path) => !/\/(tsconfig|jsconfig)\.json$/.test(path);
    }

    if (this.projectConfig.kind === ProjectConfigKind.Synthetic) {
      fs.readFile = (path) => (path === this.projectConfig.specifier ? this.resolvedConfig.tsconfig : undefined);
    }

    // TODO waiting for: https://github.com/microsoft/typescript-go/issues/4503

    this.#api = new ts.API({ fs });
  }

  close(): void {
    this.#api.close();
  }

  closeFile(filePath: string): void {
    this.#api.updateSnapshot({ closeFiles: [filePath] });
  }

  getProject(filePath: string): tsApi.Project {
    if (this.projectConfig.kind >= ProjectConfigKind.Provided) {
      const snapshot = this.#api.updateSnapshot({ openProjects: [this.projectConfig.specifier] });
      const project = snapshot.getDefaultProjectForFile(filePath);

      if (project != null) {
        return project;
      }
    }

    return this.#api.updateSnapshot({ openFiles: [filePath] }).getDefaultProjectForFile(filePath)!;
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
