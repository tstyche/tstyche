import type * as tsApi from "typescript/unstable/sync";
import { CheckerAdapter } from "#checker";
import { Options, type ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { ProjectConfigKind } from "#result";
import { Select } from "#select";
import type { NativeTypeScript } from "#typescript";
import { FileSystem } from "./FileSystem.js";
import { ProjectConfigService } from "./ProjectConfigService.js";

export class NativeProjectService {
  #api: InstanceType<typeof tsApi.API>;
  #currentProject: tsApi.Project | undefined;
  #currentSpecifier: string | undefined;
  #fs = new FileSystem();
  #projectConfig: ProjectConfigService;
  #resolvedConfig: ResolvedConfig;
  #ts: NativeTypeScript;
  #tsconfigPath: string;

  constructor(ts: NativeTypeScript, resolvedConfig: ResolvedConfig) {
    this.#ts = ts;
    this.#resolvedConfig = resolvedConfig;

    this.#api = new ts.API({ fs: this.#fs });
    this.#projectConfig = new ProjectConfigService(this.#api, resolvedConfig);
    this.#tsconfigPath = Path.resolve(resolvedConfig.rootPath, `${Date.now().toString(36)}.tsconfig.json`);
  }

  close(): void {
    this.#currentProject?.dispose();
    this.#currentProject = undefined;

    this.#api.close();
  }

  getChecker(): CheckerAdapter {
    return new CheckerAdapter(this.#ts, this.#currentProject!.checker);
  }

  #getDefaultCompilerOptions() {
    const options: Record<string, unknown> = {
      allowJs: true,
      checkJs: true,
      allowImportingTsExtensions: true,
      exactOptionalPropertyTypes: true,
      jsx: "preserve",
      module: "nodenext",
      moduleResolution: "nodenext",
      noEmit: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      resolveJsonModule: true,
      strict: true,
      target: "esnext",
    };

    return options;
  }

  getProgram(): tsApi.Program {
    return this.#currentProject!.program;
  }

  #getProjectFacts(filePath: string) {
    let compilerOptions = this.#getDefaultCompilerOptions();
    let kind = ProjectConfigKind.Default;
    let specifier = "baseline";

    switch (this.#resolvedConfig.tsconfig) {
      case "baseline":
        break;

      case "findup":
        {
          const configPath = this.#projectConfig.findUp(filePath);

          if (configPath != null) {
            compilerOptions = {};
            kind = ProjectConfigKind.Discovered;
            specifier = configPath;
          }
        }
        break;

      default:
        if (Options.isJsonString(this.#resolvedConfig.tsconfig)) {
          kind = ProjectConfigKind.Synthetic;
          specifier = this.#tsconfigPath;
        } else if (this.#api.parseConfigFile(this.#resolvedConfig.tsconfig).fileNames.includes(filePath)) {
          compilerOptions = {};
          kind = ProjectConfigKind.Provided;
          specifier = this.#resolvedConfig.tsconfig;
        }

        break;
    }

    if (kind !== ProjectConfigKind.Default && specifier === this.#currentSpecifier) {
      return { kind, project: this.#currentProject!, specifier };
    }

    if (this.#resolvedConfig.checkDeclarationFiles) {
      compilerOptions = { ...compilerOptions, skipLibCheck: false };
    }

    // TODO 'ProjectConfigKind.Synthetic' should be also extended with 'skipLibCheck: false'

    const tsconfigText =
      kind === ProjectConfigKind.Synthetic
        ? this.#resolvedConfig.tsconfig
        : JSON.stringify({
            extends: kind === ProjectConfigKind.Default ? undefined : specifier,
            compilerOptions,
            include:
              kind === ProjectConfigKind.Default ? [Path.relative(this.#resolvedConfig.rootPath, filePath)] : undefined,
          });

    this.#fs.writeFile(this.#tsconfigPath, tsconfigText);

    const snapshot = this.#api.updateSnapshot({
      openProjects: [this.#tsconfigPath],
      fileChanges: { changed: [this.#tsconfigPath] },
    });

    const project = snapshot.getProject(this.#tsconfigPath)!;

    return { kind, project, specifier };
  }

  getSemanticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    return this.#currentProject!.program.getSemanticDiagnostics(filePath);
  }

  getSyntacticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    // TODO consider including '.getBindDiagnostics()'
    return this.#currentProject!.program.getSyntacticDiagnostics(filePath);
  }

  openFile(filePath: string): void {
    const { kind, project, specifier } = this.#getProjectFacts(filePath);

    if (specifier !== this.#currentSpecifier) {
      this.#currentSpecifier = specifier;

      EventEmitter.dispatch([
        "project:uses",
        { compilerVersion: this.#ts.version, projectConfig: { kind, specifier } },
      ]);

      const configFileParsingDiagnostics = project.program.getConfigFileParsingDiagnostics();

      if (configFileParsingDiagnostics.length > 0) {
        EventEmitter.dispatch([
          "project:error",
          { diagnostics: Diagnostic.fromDiagnostics(configFileParsingDiagnostics) },
        ]);
      }
    }

    if (project === this.#currentProject) {
      return;
    }

    this.#currentProject?.dispose();
    this.#currentProject = project;

    // TODO use '.getSourceFiles()': https://github.com/microsoft/typescript-go/issues/4502
    const filesToCheck = project.program.getSourceFileNames().filter((filePath) => {
      const sourceFile = project.program.getSourceFile(filePath)!;

      if (
        project.program.isSourceFileFromExternalLibrary(sourceFile) ||
        project.program.isSourceFileDefaultLibrary(sourceFile)
      ) {
        return false;
      }

      if (this.#resolvedConfig.checkDeclarationFiles && sourceFile.isDeclarationFile) {
        return true;
      }

      if (Select.isFixtureFile(sourceFile.fileName, { ...this.#resolvedConfig, pathMatch: [] })) {
        return true;
      }

      if (Select.isTestFile(sourceFile.fileName, { ...this.#resolvedConfig, pathMatch: [] })) {
        return false;
      }

      return false;
    });

    const diagnostics = [...project.program.getProgramDiagnostics()];

    for (const filePath of filesToCheck) {
      diagnostics.push(
        ...project.program.getBindDiagnostics(filePath),
        ...project.program.getSyntacticDiagnostics(filePath),
        ...project.program.getSemanticDiagnostics(filePath),
        ...project.program.getDeclarationDiagnostics(filePath),
      );
    }

    if (diagnostics.length > 0) {
      EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
    }
  }

  updateFile(filePath: string, text: string): this {
    this.#fs.writeFile(filePath, text);

    const snapshot = this.#api.updateSnapshot({ fileChanges: { changed: [filePath] } });
    this.#currentProject = snapshot.getProject(this.#tsconfigPath)!;

    return this;
  }
}
