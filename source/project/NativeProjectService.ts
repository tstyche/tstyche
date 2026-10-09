import type * as tsAst from "typescript/ast";
import type * as tsApi from "typescript/sync";
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
import { FileMapService } from "./FileMapService.js";
import { NativeMappedDiagnostic } from "./NativeMappedDiagnostic.js";
import { ProjectConfigService } from "./ProjectConfigService.js";

export class NativeProjectService {
  #api: InstanceType<typeof tsApi.API>;
  #baseSnapshot: tsApi.Snapshot;
  #currentSnapshot: tsApi.Snapshot | undefined;
  #currentProject: tsApi.Project | undefined;
  #currentSpecifier: string | undefined;
  #declarationFileRegex = /\.d\.[cm]?ts$/;
  #fileMap = new FileMapService();
  #projectConfig: ProjectConfigService;
  #resolvedConfig: ResolvedConfig;
  #ts: ts.NativeTypeScript;
  #tsconfigPath: string;
  #tsconfigSyntheticPath: string;

  constructor(ts: ts.NativeTypeScript, resolvedConfig: ResolvedConfig) {
    this.#ts = ts;
    this.#resolvedConfig = resolvedConfig;

    this.#api = ts.getApi();
    this.#baseSnapshot = this.#api.createSnapshot();
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

  #getProjectFacts(filePath: tsAst.RootedFilePath) {
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
          if (
            this.#api
              // TODO use 'parseConfigFileTextToJson()' instead of 'JSON.parse()'
              .parseJsonConfigFileContent(JSON.parse(this.#resolvedConfig.tsconfig), {
                configFileName: this.#tsconfigSyntheticPath,
              })
              .fileNames.includes(filePath)
          ) {
            this.#fileMap.add(this.#tsconfigSyntheticPath, this.#resolvedConfig.tsconfig);

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

    if (kind !== ProjectConfigKind.Default && specifier === this.#currentSpecifier && !this.#fileMap.hasChanged()) {
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

    this.#fileMap.add(this.#tsconfigPath, tsconfigText);

    this.#currentSnapshot?.dispose();
    this.#currentSnapshot = this.#baseSnapshot.update({
      openProjects: [this.#tsconfigPath],
      fileSystem: {
        kind: "layer",
        files: this.#fileMap.get(),
      },
      ensurePrograms: true,
    });

    const project = this.#currentSnapshot.getConfiguredProject(this.#tsconfigPath)!;

    return { kind, project, specifier };
  }

  getSemanticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    return this.#normalizeDiagnostics(this.#currentProject!.program.getSemanticDiagnostics(filePath));
  }

  getSyntacticDiagnostics(filePath: string): ReadonlyArray<tsApi.Diagnostic> {
    return this.#normalizeDiagnostics(this.#currentProject!.program.getSyntacticDiagnostics(filePath));
  }

  #normalizeDiagnostics(diagnostics: ReadonlyArray<tsApi.Diagnostic>) {
    return diagnostics.map(function normalize(diagnostic: tsApi.Diagnostic): tsApi.Diagnostic {
      // remove fields that are redundant and may contain incorrect information
      const { startPosition, endPosition, sourceLines, ...rest } = diagnostic;

      return {
        ...rest,
        ...(diagnostic.messageChain && {
          messageChain: diagnostic.messageChain.map((msg) => normalize(msg)),
        }),
        ...(diagnostic.relatedInformation && {
          relatedInformation: diagnostic.relatedInformation.map((info) => normalize(info)),
        }),
      };
    });
  }

  openFile(filePath: tsAst.RootedFilePath, fileText?: string): void {
    if (fileText != null) {
      this.#fileMap.add(filePath, fileText);
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
      ...this.#normalizeDiagnostics(project.program.getProgramDiagnostics())
        // program diagnostics are always pointing to synthetic TSConfig file
        .map(({ fileName, ...rest }) => ({ ...rest, pos: -1, end: -1 })),
      ...filesToCheck.flatMap((filePath) =>
        [
          ...this.#normalizeDiagnostics(project.program.getSyntacticDiagnostics(filePath)),
          ...this.#normalizeDiagnostics(project.program.getSemanticDiagnostics(filePath)),
          ...this.#normalizeDiagnostics(project.program.getDeclarationDiagnostics(filePath)),
        ].sort((a, b) => a.pos - b.pos),
      ),
    ];

    if (diagnostics.length > 0) {
      EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
    }
  }

  openLayer(filePath: string, fileText: string): ReadonlyArray<ts.Diagnostic> {
    const snapshot = this.#currentSnapshot!.update({
      fileSystem: {
        kind: "layer",
        files: { [filePath]: fileText },
      },
      ensurePrograms: true,
    });

    const project = snapshot.getConfiguredProject(this.#tsconfigPath)!;
    const diagnostics = project.program.getSemanticDiagnostics(filePath);

    snapshot.dispose();

    return diagnostics;
  }
}
