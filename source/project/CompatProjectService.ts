import type ts6 from "@typescript/typescript6";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { ProjectConfigKind } from "#result";
import { Select } from "#select";
import { Version } from "#version";
import { BaseProjectService } from "./BaseProjectService.js";

export class CompatProjectService extends BaseProjectService {
  #compiler: typeof ts6;
  #languageService: ts6.LanguageService | undefined;
  #host: ts6.server.ServerHost;
  #lastSeenProject: string | undefined = "none";
  #seenProjects = new Set<string | undefined>();
  #seenTestFiles = new Set<string>();
  #service: ts6.server.ProjectService;

  constructor(compiler: typeof ts6, resolvedConfig: ResolvedConfig) {
    super(resolvedConfig);

    this.#compiler = compiler;

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

    if (this.projectConfig.kind === ProjectConfigKind.Synthetic) {
      this.#host.readFile = (path) =>
        path === this.projectConfig.specifier ? resolvedConfig.tsconfig : compiler.sys.readFile(path);
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

  getProgram(): ts6.Program | undefined {
    return this.#languageService?.getProgram();
  }

  #getLanguageService(filePath: string) {
    const project = this.#service.getDefaultProjectForFile(
      this.#compiler.server.toNormalizedPath(filePath),
      /* ensureProject */ true,
    );

    const compilerOptions = project?.getCompilerOptions();

    if (this.resolvedConfig.checkDeclarationFiles && compilerOptions?.skipLibCheck) {
      project?.setCompilerOptions({ ...compilerOptions, skipLibCheck: false });
    }

    return project?.getLanguageService(/* ensureSynchronized */ true);
  }

  getSemanticDiagnostics(filePath: string, sourceText?: string): Array<ts6.Diagnostic> | undefined {
    // TODO must be move to '.updateFile()'
    this.openFile(filePath, sourceText);

    return this.#languageService?.getSemanticDiagnostics(filePath);
  }

  getSyntacticDiagnostics(filePath: string): Array<ts6.Diagnostic> | undefined {
    return this.#languageService?.getSyntacticDiagnostics(filePath);
  }

  #isFileIncluded(filePath: string) {
    const configSourceFile = this.#compiler.readJsonConfigFile(this.projectConfig.specifier, this.#host.readFile);

    const { fileNames } = this.#compiler.parseJsonSourceFileConfigFileContent(
      configSourceFile,
      this.#host,
      Path.dirname(this.projectConfig.specifier),
      undefined,
      this.projectConfig.specifier,
    );

    return fileNames.includes(filePath);
  }

  openFile(filePath: string, sourceText?: string): void {
    switch (this.projectConfig.kind) {
      case ProjectConfigKind.Discovered:
        break;

      case ProjectConfigKind.Default:
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = () => undefined;
        break;

      default:
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = this.#isFileIncluded(filePath)
          ? () => this.projectConfig.specifier
          : () => undefined;
    }

    const { configFileErrors, configFileName } = this.#service.openClientFile(
      filePath,
      sourceText,
      /* scriptKind */ undefined,
      this.resolvedConfig.rootPath,
    );

    if (configFileName !== this.#lastSeenProject) {
      this.#lastSeenProject = configFileName;
      this.#languageService = this.#getLanguageService(filePath);

      const projectConfig =
        configFileName != null
          ? { ...this.projectConfig, specifier: configFileName }
          : { kind: ProjectConfigKind.Default, specifier: "baseline" };

      EventEmitter.dispatch(["project:uses", { compilerVersion: this.#compiler.version, projectConfig }]);

      if (configFileErrors && configFileErrors.length > 0) {
        EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(configFileErrors) }]);
      }
    }

    if (!this.#seenTestFiles.has(filePath)) {
      this.#seenTestFiles.add(filePath);

      const program = this.getProgram();

      if (!program || this.#seenProjects.has(configFileName)) {
        return;
      }

      this.#seenProjects.add(configFileName);

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
