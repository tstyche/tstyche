import type ts from "typescript";
import { Options, type ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { Select } from "#select";
import { SourceService } from "#source";
import { Version } from "#version";

export class ProjectService {
  #compiler: typeof ts;
  #host: ts.server.ServerHost;
  #lastSeenProject: string | undefined = "";
  #resolvedConfig: ResolvedConfig;
  #seenPrograms = new WeakSet<ts.Program>();
  #seenTestFiles = new Set<string>();
  #service: ts.server.ProjectService;
  #syntheticConfigFilePath: string | undefined;

  constructor(compiler: typeof ts, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;

    if (Options.isJsonString(resolvedConfig.tsconfig)) {
      this.#syntheticConfigFilePath = Path.resolve(resolvedConfig.rootPath, "synthetic.tsconfig.json");
    }

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

    if (this.#syntheticConfigFilePath != null) {
      this.#host.readFile = this.#getProxyReadFile(
        compiler.sys.readFile,
        this.#syntheticConfigFilePath,
        resolvedConfig.tsconfig,
      );
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
      project?.setCompilerOptions({ ...compilerOptions, skipLibCheck: false });
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

  #getProxyReadFile(
    readFile: (path: string) => string | undefined,
    syntheticConfigFilePath: string,
    syntheticConfigText: string,
  ) {
    const proxyReadFile = new Proxy(readFile, {
      apply(target, thisArg, args) {
        if (args[0] === syntheticConfigFilePath) {
          return syntheticConfigText;
        }

        return Reflect.apply(target, thisArg, args);
      },
    });

    return proxyReadFile;
  }

  #isFileIncluded(filePath: string, tsconfigFilePath: string) {
    const configSourceFile = this.#compiler.readJsonConfigFile(tsconfigFilePath, this.#host.readFile);

    const { fileNames } = this.#compiler.parseJsonSourceFileConfigFileContent(
      configSourceFile,
      this.#host,
      Path.dirname(tsconfigFilePath),
      undefined,
      tsconfigFilePath,
    );

    return fileNames.includes(filePath);
  }

  openFile(filePath: string, sourceText?: string): void {
    switch (this.#resolvedConfig.tsconfig) {
      case "findup":
        break;

      case "baseline":
      case "ignore":
        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = () => undefined;
        break;

      default: {
        const tsconfigFilePath = this.#syntheticConfigFilePath ?? this.#resolvedConfig.tsconfig;

        // @ts-expect-error: overriding private method
        this.#service.getConfigFileNameForFile = this.#isFileIncluded(filePath, tsconfigFilePath)
          ? () => tsconfigFilePath
          : () => undefined;
      }
    }

    const { configFileErrors, configFileName } = this.#service.openClientFile(
      filePath,
      sourceText,
      /* scriptKind */ undefined,
      this.#resolvedConfig.rootPath,
    );

    if (configFileName !== this.#lastSeenProject) {
      this.#lastSeenProject = configFileName;

      EventEmitter.dispatch([
        "project:uses",
        {
          compilerVersion: this.#compiler.version,
          projectConfigFilePath: this.#syntheticConfigFilePath ? undefined : configFileName,
        },
      ]);

      // TODO diagnostics should not include synthetic path

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

      const diagnostics: Array<ts.Diagnostic> = [];

      for (const sourceFile of sourceFilesToCheck) {
        diagnostics.push(...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile));
      }

      if (diagnostics.length > 0) {
        EventEmitter.dispatch(["project:error", { diagnostics: Diagnostic.fromDiagnostics(diagnostics) }]);
      }
    }
  }
}
