import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Version } from "#version";

export class ProjectService {
  #service: ts.server.ProjectService;

  constructor(public compiler: typeof ts) {
    function doNothing() {
      // does nothing
    }

    function returnFalse() {
      return false;
    }

    function returnUndefined() {
      return undefined;
    }

    const noopWatcher = { close: doNothing };

    const noopLogger: ts.server.Logger = {
      close: doNothing,
      endGroup: doNothing,
      getLogFileName: returnUndefined,
      hasLevel: returnFalse,
      info: doNothing,
      loggingEnabled: returnFalse,
      msg: doNothing,
      perftrc: doNothing,
      startGroup: doNothing,
    };

    const host: ts.server.ServerHost = {
      ...this.compiler.sys,
      clearImmediate,
      clearTimeout,
      setImmediate,
      setTimeout,
      watchDirectory: () => noopWatcher,
      watchFile: () => noopWatcher,
    };

    this.#service = new this.compiler.server.ProjectService({
      allowLocalPluginLoads: true,
      cancellationToken: this.compiler.server.nullCancellationToken,
      host,
      logger: noopLogger,
      session: undefined,
      useInferredProjectPerProjectRoot: true,
      useSingleInferredProject: false,
    });

    this.#service.setCompilerOptionsForInferredProjects(this.#getCompilerOptionsForInferredProjects());
  }

  closeFile(filePath: string): void {
    this.#service.closeClientFile(filePath);
  }

  #getCompilerOptionsForInferredProjects() {
    const projectConfig: ts.server.protocol.InferredProjectCompilerOptions = {
      allowJs: true,
      checkJs: true,
      esModuleInterop: true,
      jsx: "preserve" as ts.server.protocol.JsxEmit,
      module: "esnext" as ts.server.protocol.ModuleKind,
      moduleResolution: "node" as ts.server.protocol.ModuleResolutionKind,
      resolveJsonModule: true,
      strictFunctionTypes: true,
      strictNullChecks: true,
      target: "esnext" as ts.server.protocol.ScriptTarget,
    };

    if (Version.isSatisfiedWith(this.compiler.version, "5")) {
      projectConfig["allowImportingTsExtensions"] = true;
      projectConfig.moduleResolution = "bundler" as ts.server.protocol.ModuleResolutionKind;
    }

    return projectConfig;
  }

  getDefaultProject(filePath: string): ts.server.Project | undefined {
    return this.#service.getDefaultProjectForFile(
      this.compiler.server.toNormalizedPath(filePath),
      /* ensureProject */ true,
    );
  }

  getLanguageService(filePath: string): ts.LanguageService | undefined {
    const project = this.getDefaultProject(filePath);

    if (!project) {
      return;
    }

    return project.getLanguageService(/* ensureSynchronized */ true);
  }

  openFile(filePath: string, sourceText?: string | undefined, projectRootPath?: string | undefined): void {
    const { configFileErrors, configFileName } = this.#service.openClientFile(
      filePath,
      sourceText,
      /* scriptKind */ undefined,
      projectRootPath,
    );

    EventEmitter.dispatch([
      "project:info",
      { compilerVersion: this.compiler.version, projectConfigFilePath: configFileName },
    ]);

    if (configFileErrors && configFileErrors.length > 0) {
      EventEmitter.dispatch([
        "project:error",
        { diagnostics: Diagnostic.fromDiagnostics(configFileErrors, this.compiler) },
      ]);
    }
  }
}
