import type ts from "typescript";
import { Options, type ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { type ProjectConfig, ProjectConfigKind } from "#result";
import { Select } from "#select";
import { SourceService } from "#source";
import { Version } from "#version";

export class ProjectService {
  #compiler: typeof ts;
  #host: ts.server.ServerHost;
  #lastSeenProject: string | undefined = "";
  #projectConfig: ProjectConfig;
  #resolvedConfig: ResolvedConfig;
  #seenPrograms = new Set<ts.Program>();
  #seenTestFiles = new Set<string>();
  #service: ts.server.ProjectService;

  constructor(compiler: typeof ts, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;

    this.#projectConfig = this.#resolveProjectConfig(resolvedConfig.tsconfig);

    const noop = () => undefined;

    const noopLogger: ts.server.Logger = {
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
    this.#service.closeClientFile(filePath);
    SourceService.delete(filePath);
  }

  #getDefaultCompilerOptions() {
    const defaultCompilerOptions: ts.server.protocol.CompilerOptions = {
      allowJs: true,
      checkJs: true,
      allowImportingTsExtensions: true,
      exactOptionalPropertyTypes: true,
      jsx: this.#compiler.JsxEmit.Preserve,
      module: this.#compiler.ModuleKind.NodeNext,
      moduleResolution: this.#compiler.ModuleResolutionKind.NodeNext,
      noUncheckedIndexedAccess: true,
      resolveJsonModule: true,
      strict: true,
      verbatimModuleSyntax: true,
      target: this.#compiler.ScriptTarget.ESNext,
    };

    if (Version.isSatisfiedWith(this.#compiler.version, "5.6")) {
      defaultCompilerOptions.noUncheckedSideEffectImports = true;
    }

    return defaultCompilerOptions;
  }

  getDefaultProject(filePath: string): ts.server.Project | undefined {
    const project = this.#service.getDefaultProjectForFile(
      this.#compiler.server.toNormalizedPath(filePath),
      /* ensureProject */ true,
    );

    const compilerOptions = project?.getCompilerOptions();

    if (this.#resolvedConfig.checkDeclarationFiles && compilerOptions?.skipLibCheck) {
      project?.setCompilerOptions({ ...compilerOptions, declaration: true, skipLibCheck: false });
    }

    return project;
  }

  getDiagnostics(
    filePath: string,
    sourceText: string,
    shouldInclude?: (diagnostic: ts.Diagnostic) => boolean,
  ): Array<ts.Diagnostic> | undefined {
    this.openFile(filePath, sourceText);

    const languageService = this.getLanguageService(filePath);
    const diagnostics = languageService?.getSemanticDiagnostics(filePath);

    if (diagnostics != null && shouldInclude != null) {
      return diagnostics.filter(shouldInclude);
    }

    return diagnostics;
  }

  getLanguageService(filePath: string): ts.LanguageService | undefined {
    const project = this.getDefaultProject(filePath);

    return project?.getLanguageService(/* ensureSynchronized */ true);
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

  #resolveProjectConfig(specifier: string): ProjectConfig {
    if (specifier === "baseline") {
      return { kind: ProjectConfigKind.Default, specifier: "baseline" };
    }

    if (specifier === "findup") {
      return { kind: ProjectConfigKind.Discovered, specifier: "" };
    }

    if (Options.isJsonString(specifier)) {
      return {
        kind: ProjectConfigKind.Synthetic,
        specifier: Path.resolve(this.#resolvedConfig.rootPath, `${Math.random().toString(32).slice(2)}.tsconfig.json`),
      };
    }

    return { kind: ProjectConfigKind.Provided, specifier };
  }

  openFile(filePath: string, sourceText?: string): void {
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
      sourceText,
      /* scriptKind */ undefined,
      this.#resolvedConfig.rootPath,
    );

    if (configFileName !== this.#lastSeenProject) {
      this.#lastSeenProject = configFileName;

      const projectConfig =
        configFileName != null
          ? { ...this.#projectConfig, specifier: configFileName }
          : { kind: ProjectConfigKind.Default, specifier: "baseline" };

      EventEmitter.dispatch(["project:uses", { compilerVersion: this.#compiler.version, projectConfig }]);

      if (configFileErrors && configFileErrors.length > 0) {
        EventEmitter.dispatch([
          "project:error",
          { diagnostics: Diagnostic.fromDiagnostics(configFileErrors as Array<ts.Diagnostic>) },
        ]);
      }
    }

    if (!this.#seenTestFiles.has(filePath)) {
      this.#seenTestFiles.add(filePath);

      const languageService = this.getLanguageService(filePath);

      const program = languageService?.getProgram();

      if (!program || this.#seenPrograms.has(program)) {
        return;
      }

      this.#seenPrograms.add(program);

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

      const diagnostics = [...program.getOptionsDiagnostics()];

      for (const sourceFile of sourceFilesToCheck) {
        diagnostics.push(
          ...program.getSyntacticDiagnostics(sourceFile),
          ...program.getSemanticDiagnostics(sourceFile),
          ...program.getDeclarationDiagnostics(sourceFile),
        );
      }

      if (diagnostics.length > 0) {
        EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
      }
    }
  }
}
