import fs from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { Version } from "#version";
import { Fetcher } from "./Fetcher.js";
import { LockService } from "./LockService.js";
import type { Manifest } from "./Manifest.js";
import { ManifestService } from "./ManifestService.js";
import { PackageService } from "./PackageService.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

export class StoreService {
  #compilerInstanceCache = new Map<string, typeof ts>();
  #fetcher: Fetcher;
  #lockService: LockService;
  #manifest: Manifest | undefined;
  #manifestWorker: ManifestService;
  #packageService: PackageService;
  #npmRegistry = Environment.npmRegistry;
  #storePath: string;

  constructor() {
    this.#storePath = Environment.storePath;

    this.#fetcher = new Fetcher(this.#onDiagnostics);
    this.#lockService = new LockService(this.#onDiagnostics);

    this.#packageService = new PackageService(this.#storePath, this.#fetcher, this.#lockService);
    this.#manifestWorker = new ManifestService(this.#storePath, this.#npmRegistry, this.#fetcher);
  }

  async getSupportedTags(): Promise<Array<string> | undefined> {
    await this.open();

    return this.#manifest?.getSupportedTags();
  }

  async install(tag: string): Promise<void> {
    if (tag === "current") {
      return;
    }

    await this.open();

    const version = this.#manifest?.resolve(tag);

    if (!version) {
      this.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

      return;
    }

    await this.#packageService.ensure(version, this.#manifest);
  }

  async load(tag: string): Promise<typeof ts | undefined> {
    let compilerInstance = this.#compilerInstanceCache.get(tag);

    if (compilerInstance != null) {
      return compilerInstance;
    }

    let modulePath: string | undefined;

    if (tag === "current" && Environment.typescriptPath != null) {
      modulePath = Environment.typescriptPath;
    } else {
      await this.open();

      const version = this.#manifest?.resolve(tag);

      if (!version) {
        this.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

        return;
      }

      compilerInstance = this.#compilerInstanceCache.get(version);

      if (compilerInstance != null) {
        return compilerInstance;
      }

      modulePath = await this.#packageService.ensure(version, this.#manifest);
    }

    if (modulePath != null) {
      compilerInstance = await this.#loadModule(modulePath);

      this.#compilerInstanceCache.set(tag, compilerInstance);
      this.#compilerInstanceCache.set(compilerInstance.version, compilerInstance);
    }

    return compilerInstance;
  }

  async #loadModule(modulePath: string) {
    const exports = {};
    const module = { exports };

    // TODO there is no need to handle 'tsserverlibrary.js' after dropping support for TypeScript 5.2
    const candidatePaths = [Path.join(Path.dirname(modulePath), "tsserverlibrary.js"), modulePath];

    for (const candidatePath of candidatePaths) {
      const sourceText = await fs.readFile(candidatePath, { encoding: "utf8" });

      if (!sourceText.includes("isTypeRelatedTo")) {
        continue;
      }

      const toExpose = [
        "getTypeOfSymbol", // TODO remove after dropping support for TypeScript 4.5
        "isTypeRelatedTo",
        "relation: { assignable: assignableRelation, identity: identityRelation, subtype: strictSubtypeRelation }",
      ];

      const modifiedSourceText = sourceText.replace(
        "return checker;",
        `return { ...checker, ${toExpose.join(", ")} };`,
      );

      const compiledWrapper = vm.compileFunction(
        modifiedSourceText,
        ["exports", "require", "module", "__filename", "__dirname"],
        { filename: candidatePath },
      );

      compiledWrapper(exports, createRequire(candidatePath), module, candidatePath, Path.dirname(candidatePath));

      break;
    }

    return module.exports as typeof ts;
  }

  #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["store:error", { diagnostics: [diagnostic] }]);
  }

  async open(): Promise<void> {
    if (!this.#manifest) {
      this.#manifest = await this.#manifestWorker.open();
    }
  }

  async update(): Promise<void> {
    await this.#manifestWorker.open({ refresh: true });
  }

  async validateTag(tag: string): Promise<boolean | undefined> {
    if (tag === "current") {
      return Environment.typescriptPath != null;
    }

    await this.open();

    if (
      this.#manifest?.isOutdated({ ageTolerance: 60 /* one minute */ }) &&
      (!Version.isVersionTag(tag) ||
        (this.#manifest.resolutions["latest"] != null &&
          Version.isGreaterThan(tag, this.#manifest.resolutions["latest"])))
    ) {
      this.#onDiagnostics(
        Diagnostic.warning([
          StoreDiagnosticText.failedToUpdateMetadata(this.#npmRegistry),
          StoreDiagnosticText.maybeOutdatedResolution(tag),
        ]),
      );
    }

    return this.#manifest?.validate(tag);
  }
}
