import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";

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
      cancellationToken: this.compiler.server.nullCancellationToken,
      host,
      logger: noopLogger,
      session: undefined,
      useInferredProjectPerProjectRoot: true,
      useSingleInferredProject: false,
    });
  }

  closeFile(filePath: string): void {
    this.#service.closeClientFile(filePath);
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
