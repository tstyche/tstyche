import type * as tsApi from "typescript/unstable/sync";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { ProjectConfigKind } from "#result";
import type { NativeTypeScript } from "#typescript";
import { BaseProjectService } from "./BaseProjectService.js";
import { FileSystem } from "./FileSystem.js";

export class NativeProjectService extends BaseProjectService {
  #api: InstanceType<NativeTypeScript["API"]>;
  #currentProject: tsApi.Project | undefined;
  #fs = new FileSystem();
  #ts: NativeTypeScript;

  constructor(ts: NativeTypeScript, resolvedConfig: ResolvedConfig) {
    super(resolvedConfig);

    this.#ts = ts;

    if (this.projectConfig.kind >= ProjectConfigKind.Default) {
      this.#fs.ignorePattern(/\/(tsconfig|jsconfig)\.json$/);
    }

    if (this.projectConfig.kind === ProjectConfigKind.Synthetic) {
      this.#fs.updateFile(this.projectConfig.specifier, this.resolvedConfig.tsconfig);
    }

    // TODO waiting for: https://github.com/microsoft/typescript-go/issues/4503

    this.#api = new ts.API({ fs: this.#fs.get() });
  }

  close(): void {
    this.#api.close();
  }

  closeFile(filePath: string): void {
    this.#api.updateSnapshot({ closeFiles: [filePath] });
  }

  getProgram(): tsApi.Program {
    return this.#currentProject!.program;
  }

  #getProject(filePath: string) {
    if (this.projectConfig.kind >= ProjectConfigKind.Provided) {
      const snapshot = this.#api.updateSnapshot({ openProjects: [this.projectConfig.specifier] });
      const project = snapshot.getDefaultProjectForFile(filePath);

      if (project != null) {
        return project;
      }
    }

    return this.#api.updateSnapshot({ openFiles: [filePath] }).getDefaultProjectForFile(filePath)!;
  }

  getSemanticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    return this.#currentProject!.program.getSemanticDiagnostics(filePath);
  }

  getSyntacticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    // TODO consider including '.getBindDiagnostics()'
    return this.#currentProject!.program.getSyntacticDiagnostics(filePath);
  }

  openFile(filePath: string): void {
    const project = this.#getProject(filePath);

    if (project !== this.#currentProject) {
      this.#currentProject?.dispose();
      this.#currentProject = project;

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
          { diagnostics: Diagnostic.fromDiagnostics(configFileParsingDiagnostics) },
        ]);
      }
    }
  }

  updateFile(filePath: string, sourceText: string): this {
    this.#fs.updateFile(filePath, sourceText);
    this.#api.updateSnapshot({ fileChanges: { changed: [filePath] } });

    this.#currentProject = this.#getProject(filePath);

    return this;
  }
}
