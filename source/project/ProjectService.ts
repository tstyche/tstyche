import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Select } from "#select";

export class ProjectService {
  #compiler: typeof ts;
  #lastSeenProject: string | undefined = "";
  #resolvedConfig: ResolvedConfig;
  #seenPrograms = new WeakSet<ts.Program>();
  #service: ts.server.ProjectService;

  constructor(resolvedConfig: ResolvedConfig, compiler: typeof ts) {
    this.#resolvedConfig = resolvedConfig;
    this.#compiler = compiler;

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

    const host: ts.server.ServerHost = {
      ...this.#compiler.sys,
      clearImmediate,
      clearTimeout,
      setImmediate,
      setTimeout,
      watchDirectory: () => noopWatcher,
      watchFile: () => noopWatcher,
    };

    this.#service = new this.#compiler.server.ProjectService({
      allowLocalPluginLoads: true,
      cancellationToken: this.#compiler.server.nullCancellationToken,
      host,
      logger: noopLogger,
      session: undefined,
      useInferredProjectPerProjectRoot: true,
      useSingleInferredProject: false,
    });

    switch (this.#resolvedConfig.tsconfig) {
      case "findup":
        break;

      case "ignore":
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = () => undefined;
        break;

      default:
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = () => this.#resolvedConfig.tsconfig;
    }

    this.#service.setCompilerOptionsForInferredProjects(this.#getDefaultCompilerOptions());
  }

  closeFile(filePath: string): void {
    this.#service.closeClientFile(filePath);
  }

  #getDefaultCompilerOptions() {
    const defaultCompilerOptions: ts.server.protocol.CompilerOptions = {
      allowImportingTsExtensions: true,
      allowJs: true,
      checkJs: true,
      exactOptionalPropertyTypes: true,
      jsx: "preserve" as ts.server.protocol.JsxEmit,
      module: "nodenext" as ts.server.protocol.ModuleKind,
      moduleResolution: "nodenext" as ts.server.protocol.ModuleResolutionKind,
      noUncheckedIndexedAccess: true,
      resolveJsonModule: true,
      strict: true,
      target: "esnext" as ts.server.protocol.ScriptTarget,
      verbatimModuleSyntax: true,
    };

    return defaultCompilerOptions;
  }

  getDefaultProject(filePath: string): ts.server.Project | undefined {
    const project = this.#service.getDefaultProjectForFile(
      this.#compiler.server.toNormalizedPath(filePath),
      /* ensureProject */ true,
    );

    const compilerOptions = project?.getCompilerOptions();

    if (this.#resolvedConfig.checkSourceFiles && compilerOptions?.skipLibCheck) {
      project?.setCompilerOptions({ ...compilerOptions, skipLibCheck: false });
    }

    return project;
  }

  getLanguageService(filePath: string): ts.LanguageService | undefined {
    const project = this.getDefaultProject(filePath);

    return project?.getLanguageService(/* ensureSynchronized */ true);
  }

  openFile(filePath: string, sourceText?: string | undefined, projectRootPath?: string | undefined): void {
    const { configFileErrors, configFileName } = this.#service.openClientFile(
      filePath,
      sourceText,
      /* scriptKind */ undefined,
      projectRootPath,
    );

    if (configFileName !== this.#lastSeenProject) {
      this.#lastSeenProject = configFileName;

      EventEmitter.dispatch([
        "project:uses",
        { compilerVersion: this.#compiler.version, projectConfigFilePath: configFileName },
      ]);
    }

    if (configFileErrors && configFileErrors.length > 0) {
      EventEmitter.dispatch([
        "project:error",
        { diagnostics: Diagnostic.fromDiagnostics(configFileErrors as Array<ts.Diagnostic>) },
      ]);
    }

    if (this.#resolvedConfig.checkSourceFiles) {
      const languageService = this.getLanguageService(filePath);

      const program = languageService?.getProgram();

      if (!program || this.#seenPrograms.has(program)) {
        return;
      }

      this.#seenPrograms.add(program);

      const filesToCheck: Array<ts.SourceFile> = [];

      for (const sourceFile of program.getSourceFiles()) {
        if (program.isSourceFileFromExternalLibrary(sourceFile) || program.isSourceFileDefaultLibrary(sourceFile)) {
          continue;
        }

        if (!Select.isTestFile(sourceFile.fileName, { ...this.#resolvedConfig, pathMatch: [] })) {
          filesToCheck.push(sourceFile);
        }
      }

      const diagnostics: Array<ts.Diagnostic> = [];

      for (const sourceFile of filesToCheck) {
        diagnostics.push(...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile));
      }

      if (diagnostics.length > 0) {
        EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);

        return;
      }
    }
  }
}
