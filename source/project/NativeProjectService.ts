import type * as tsApi from "typescript/unstable/sync";
import { CheckerAdapter } from "#checker";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { ProjectConfigKind } from "#result";
import { Select } from "#select";
import type { NativeTypeScript } from "#typescript";
import { BaseProjectService } from "./BaseProjectService.js";
import { FileSystem } from "./FileSystem.js";

export class NativeProjectService extends BaseProjectService {
  #api: InstanceType<NativeTypeScript["API"]>;
  #currentProject: tsApi.Project | undefined;
  #fs = new FileSystem();
  #seenProjects = new WeakSet<tsApi.Project>();
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
    this.#currentProject?.dispose();
    this.#currentProject = undefined;

    this.#api.close();
  }

  closeFile(filePath: string): void {
    this.#api.updateSnapshot({ closeFiles: [filePath] });
  }

  getChecker(): CheckerAdapter {
    return new CheckerAdapter(this.#currentProject!.checker);
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

    if (this.#seenProjects.has(project)) {
      return;
    }

    this.#seenProjects.add(project);

    const program = this.getProgram();

    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4502
    const sourceFilesToCheck = program.getSourceFiles().filter((sourceFile) => {
      if (program.isSourceFileFromExternalLibrary(sourceFile) || program.isSourceFileDefaultLibrary(sourceFile)) {
        return false;
      }

      if (this.resolvedConfig.checkDeclarationFiles && sourceFile.isDeclarationFile) {
        return true;
      }

      if (Select.isFixtureFile(sourceFile.fileName, { ...this.resolvedConfig, pathMatch: [] })) {
        return true;
      }

      if (Select.isTestFile(sourceFile.fileName, { ...this.resolvedConfig, pathMatch: [] })) {
        return false;
      }

      return false;
    });

    const diagnostics = [...program.getProgramDiagnostics()];

    for (const sourceFile of sourceFilesToCheck) {
      diagnostics.push(
        // TODO consider including '.getBindDiagnostics()'

        ...program.getSyntacticDiagnostics(sourceFile),
        ...program.getSemanticDiagnostics(sourceFile),
        ...program.getDeclarationDiagnostics(sourceFile),
      );
    }

    if (diagnostics.length > 0) {
      EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
    }
  }

  updateFile(filePath: string, sourceText: string): this {
    this.#fs.updateFile(filePath, sourceText);
    this.#api.updateSnapshot({ fileChanges: { changed: [filePath] } });

    this.#currentProject = this.#getProject(filePath);

    return this;
  }
}
