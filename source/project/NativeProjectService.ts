import type * as tsAst from "typescript/unstable/ast";
import type * as tsApi from "typescript/unstable/sync";
import { NativeCheckerAdapter } from "#checker";
import { Options, type ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import type { Offset } from "#editor";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { ProjectConfigKind } from "#result";
import { Select } from "#select";
import type * as ts from "#typescript";
import { TextFileService } from "../text/TextFileService.js";
import { FileSystem } from "./FileSystem.js";
import { NativeMappedDiagnostic } from "./NativeMappedDiagnostic.js";
import { ProjectConfigService } from "./ProjectConfigService.js";

export class NativeProjectService {
  #api: InstanceType<typeof tsApi.API>;
  #currentProject: tsApi.Project | undefined;
  #currentSpecifier: string | undefined;
  #declarationFileRegex = /\.d\.[cm]?ts$/;
  #fs = new FileSystem();
  #projectConfig: ProjectConfigService;
  #resolvedConfig: ResolvedConfig;
  #ts: ts.NativeTypeScript;
  #tsconfigPath: string;
  #tsconfigSyntheticPath: string;

  constructor(ts: ts.NativeTypeScript, resolvedConfig: ResolvedConfig) {
    this.#ts = ts;
    this.#resolvedConfig = resolvedConfig;

    this.#api = ts.getApi(this.#fs);
    this.#projectConfig = new ProjectConfigService(this.#api, resolvedConfig);

    const id = Date.now().toString(36);

    this.#tsconfigPath = Path.resolve(resolvedConfig.rootPath, `${id}.tsconfig.json`);
    this.#tsconfigSyntheticPath = Path.resolve(resolvedConfig.rootPath, `${id}-synthetic.tsconfig.json`);
  }

  close(): void {
    this.#currentProject?.dispose();
    this.#currentProject = undefined;

    this.#api.close();
  }

  closeFile(): void {
    TextFileService.close();
  }

  getChecker(): NativeCheckerAdapter {
    return new NativeCheckerAdapter(this.#ts, this.#currentProject!.checker);
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

  getMappedDiagnostic(
    sourceFile: ts.SourceFile,
    diagnostic: ts.Diagnostic,
    offsets?: Array<Offset>,
  ): NativeMappedDiagnostic {
    return new NativeMappedDiagnostic(sourceFile as tsAst.SourceFile, diagnostic as tsApi.Diagnostic, offsets);
  }

  getProgram(): tsApi.Program {
    return this.#currentProject!.program;
  }

  getSourceFile(filePath: string): tsAst.SourceFile | undefined {
    return this.#currentProject!.program.getSourceFile(filePath);
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
          this.#fs.writeFile(this.#tsconfigSyntheticPath, this.#resolvedConfig.tsconfig);

          if (this.#api.parseConfigFile(this.#tsconfigSyntheticPath).fileNames.includes(filePath)) {
            compilerOptions = {};
            kind = ProjectConfigKind.Synthetic;
            specifier = this.#tsconfigSyntheticPath;
          }
        } else if (this.#api.parseConfigFile(this.#resolvedConfig.tsconfig).fileNames.includes(filePath)) {
          compilerOptions = {};
          kind = ProjectConfigKind.Provided;
          specifier = this.#resolvedConfig.tsconfig;
        }
    }

    if (kind !== ProjectConfigKind.Default && specifier === this.#currentSpecifier && !this.#fs.hasChanged()) {
      return { kind, project: this.#currentProject!, specifier };
    }

    if (this.#resolvedConfig.checkDeclarationFiles) {
      compilerOptions = { ...compilerOptions, skipLibCheck: false };
    }

    const tsconfigText = JSON.stringify({
      extends: kind === ProjectConfigKind.Default ? undefined : specifier,
      compilerOptions,
      include:
        kind === ProjectConfigKind.Default ? [Path.relative(this.#resolvedConfig.rootPath, filePath)] : undefined,
    });

    this.#fs.writeFile(this.#tsconfigPath, tsconfigText);

    const snapshot = this.#api.updateSnapshot({
      openProjects: [this.#tsconfigPath],
      fileChanges: {
        changed: [...this.#fs.getChanged()],
      },
    });

    const project = snapshot.getProject(this.#tsconfigPath)!;

    return { kind, project, specifier };
  }

  getSemanticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    return this.#currentProject!.program.getSemanticDiagnostics(filePath);
  }

  getSyntacticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    return this.#currentProject!.program.getSyntacticDiagnostics(filePath);
  }

  openFile(filePath: string, fileText?: string): void {
    if (fileText != null) {
      this.#fs.writeFile(filePath, fileText);
    }

    const { kind, project, specifier } = this.#getProjectFacts(filePath);

    TextFileService.open(project.program);

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

    const filesToCheck = project.program.getSourceFileNames().filter((filePath) => {
      const sourceFileMetadata = project.program.getSourceFileMetadata(filePath)!;

      if (sourceFileMetadata.isFromExternalLibrary || sourceFileMetadata.isDefaultLibrary) {
        return false;
      }

      if (this.#resolvedConfig.checkDeclarationFiles && this.#declarationFileRegex.test(filePath)) {
        return true;
      }

      if (Select.isFixtureFile(filePath, this.#resolvedConfig)) {
        return true;
      }

      return false;
    });

    const diagnostics = [
      ...project.program
        .getProgramDiagnostics()
        // program diagnostics are always pointing to synthetic TSConfig file
        .map(({ fileName, ...rest }) => ({ ...rest, pos: -1, end: -1 })),
      ...filesToCheck.flatMap((filePath) =>
        [
          ...project.program.getSyntacticDiagnostics(filePath),
          ...project.program.getSemanticDiagnostics(filePath),
          ...project.program.getDeclarationDiagnostics(filePath),
        ].sort((a, b) => a.pos - b.pos),
      ),
    ];

    if (diagnostics.length > 0) {
      EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
    }
  }

  openLayer(filePath: string, fileText: string): ReadonlyArray<ts.Diagnostic> {
    this.#fs.writeTempFile(filePath, fileText);

    const snapshot = this.#api.updateSnapshot({ fileChanges: { changed: [filePath] } });
    const project = snapshot.getProject(this.#tsconfigPath)!;
    const diagnostics = project.program.getSemanticDiagnostics(filePath);

    return diagnostics;
  }
}
