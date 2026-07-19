import type ts6 from "@typescript/typescript6";
import { CompatCheckerAdapter } from "#checker";
import { Options, type ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import type { Offset } from "#editor";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { type ProjectConfig, ProjectConfigKind } from "#result";
import { Select } from "#select";
import { TextFileService } from "#text";
import type * as ts from "#typescript";
import { Version } from "#version";
import { CompatMappedDiagnostic } from "./CompatMappedDiagnostic.js";

export class CompatProjectService {
  #compiler: typeof ts6;
  #languageService: ts6.LanguageService | undefined;
  #host: ts6.server.ServerHost;
  #lastSeenProject: string | undefined = "none";
  #projectConfig: ProjectConfig;
  #resolvedConfig: ResolvedConfig;
  #seenProjects = new Set<string | undefined>();
  #service: ts6.server.ProjectService;

  constructor(compiler: typeof ts6, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#projectConfig = this.#resolveProjectConfig(resolvedConfig);
    this.#resolvedConfig = resolvedConfig;

    const noop = () => undefined;

    const noopLogger: ts6.server.Logger = {
      close: noop,
      endGroup: noop,
      getLogFileName: noop,
      hasLevel: () => false,
      info: noop,
      loggingEnabled: () => false,
      msg: noop,
      perftrc: noop,
      startGroup: noop,
    };

    const noopWatcher = {
      close: noop,
    };

    this.#host = {
      ...compiler.sys,
      clearImmediate,
      clearTimeout,
      setImmediate,
      setTimeout,
      watchDirectory: () => noopWatcher,
      watchFile: () => noopWatcher,
    };

    if (this.#projectConfig.kind === ProjectConfigKind.Synthetic) {
      this.#host.readFile = (path) =>
        path === this.#projectConfig.specifier ? resolvedConfig.tsconfig : compiler.sys.readFile(path);
    }

    this.#service = new this.#compiler.server.ProjectService({
      allowLocalPluginLoads: true,
      cancellationToken: this.#compiler.server.nullCancellationToken,
      host: this.#host,
      logger: noopLogger,
      session: undefined,
      useInferredProjectPerProjectRoot: true,
      useSingleInferredProject: false,
    });

    this.#service.setCompilerOptionsForInferredProjects(this.#getDefaultCompilerOptions());
  }

  closeFile(filePath: string): void {
    TextFileService.close();
    this.#service.closeClientFile(filePath);
  }

  #getDefaultCompilerOptions() {
    const defaultCompilerOptions: ts6.server.protocol.CompilerOptions = {
      allowJs: true,
      checkJs: true,
      allowImportingTsExtensions: true,
      exactOptionalPropertyTypes: true,
      jsx: this.#compiler.JsxEmit.Preserve,
      module: this.#compiler.ModuleKind.NodeNext,
      moduleResolution: this.#compiler.ModuleResolutionKind.NodeNext,
      noEmit: true,
      noUncheckedIndexedAccess: true,
      resolveJsonModule: true,
      strict: true,
      target: this.#compiler.ScriptTarget.ESNext,
    };

    if (Version.isSatisfiedWith(this.#compiler.version, "5.6")) {
      defaultCompilerOptions.noUncheckedSideEffectImports = true;
    }

    return defaultCompilerOptions;
  }

  getChecker(): CompatCheckerAdapter {
    return new CompatCheckerAdapter(this.#compiler, this.#languageService!.getProgram()!.getTypeChecker());
  }

  getMappedDiagnostic(
    sourceFile: ts.SourceFile,
    diagnostic: ts.Diagnostic,
    offsets?: Array<Offset>,
  ): CompatMappedDiagnostic {
    return new CompatMappedDiagnostic(sourceFile as ts6.SourceFile, diagnostic as ts6.Diagnostic, offsets);
  }

  getProgram(): ts6.Program {
    return this.#languageService!.getProgram()!;
  }

  getSourceFile(filePath: string): ts6.SourceFile | undefined {
    return this.#languageService!.getProgram()!.getSourceFile(filePath);
  }

  #getLanguageService(filePath: string) {
    const project = this.#service.getDefaultProjectForFile(
      this.#compiler.server.toNormalizedPath(filePath),
      /* ensureProject */ true,
    );

    const compilerOptions = project?.getCompilerOptions();

    if (this.#resolvedConfig.checkDeclarationFiles && compilerOptions?.skipLibCheck) {
      project?.setCompilerOptions({ ...compilerOptions, skipLibCheck: false });
    }

    return project?.getLanguageService(/* ensureSynchronized */ true);
  }

  getSemanticDiagnostics(filePath: string): ReadonlyArray<ts6.Diagnostic> {
    return this.getProgram().getSemanticDiagnostics(this.getSourceFile(filePath)!);
  }

  getSyntacticDiagnostics(filePath: string): ReadonlyArray<ts6.Diagnostic> {
    return this.getProgram().getSyntacticDiagnostics(this.getSourceFile(filePath)!);
  }

  #isFileIncluded(filePath: string) {
    const configSourceFile = this.#compiler.readJsonConfigFile(this.#projectConfig.specifier, this.#host.readFile);

    const { fileNames } = this.#compiler.parseJsonSourceFileConfigFileContent(
      configSourceFile,
      this.#host,
      Path.dirname(this.#projectConfig.specifier),
      undefined,
      this.#projectConfig.specifier,
    );

    return fileNames.includes(filePath);
  }

  openFile(filePath: string, fileText?: string): void {
    switch (this.#projectConfig.kind) {
      case ProjectConfigKind.Discovered:
        break;

      case ProjectConfigKind.Default:
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = () => undefined;
        break;

      default:
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = this.#isFileIncluded(filePath)
          ? () => this.#projectConfig.specifier
          : () => undefined;
    }

    const { configFileErrors, configFileName } = this.#service.openClientFile(
      filePath,
      fileText,
      /* scriptKind */ undefined,
      this.#resolvedConfig.rootPath,
    );

    if (configFileName !== this.#lastSeenProject) {
      this.#lastSeenProject = configFileName;
      this.#languageService = this.#getLanguageService(filePath);

      const projectConfig =
        configFileName != null
          ? { ...this.#projectConfig, specifier: configFileName }
          : { kind: ProjectConfigKind.Default, specifier: "baseline" };

      EventEmitter.dispatch(["project:uses", { compilerVersion: this.#compiler.version, projectConfig }]);

      if (configFileErrors && configFileErrors.length > 0) {
        EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(configFileErrors) }]);
      }
    }

    const program = this.getProgram();

    TextFileService.open(program);

    if (this.#seenProjects.has(configFileName)) {
      return;
    }

    this.#seenProjects.add(configFileName);

    const sourceFilesToCheck = program.getSourceFiles().filter((sourceFile) => {
      if (program.isSourceFileFromExternalLibrary(sourceFile) || program.isSourceFileDefaultLibrary(sourceFile)) {
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

    const diagnostics = [
      ...program.getOptionsDiagnostics(),
      ...sourceFilesToCheck.flatMap((sourceFile) =>
        [
          ...program.getSyntacticDiagnostics(sourceFile),
          ...program.getSemanticDiagnostics(sourceFile),
          ...program.getDeclarationDiagnostics(sourceFile),
        ].sort((a, b) => a.start! - b.start!),
      ),
    ];

    if (diagnostics.length > 0) {
      EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
    }
  }

  openLayer(filePath: string, fileText: string): ReadonlyArray<ts.Diagnostic> {
    this.#service.openClientFile(filePath, fileText, /* scriptKind */ undefined, this.#resolvedConfig.rootPath);

    return this.getSemanticDiagnostics(filePath);
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
