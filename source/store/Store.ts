import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { Version } from "#version";
import { Fetcher } from "./Fetcher.js";
import { LockService } from "./LockService.js";
import type { Manifest } from "./Manifest.js";
import { ManifestService } from "./ManifestService.js";
import { PackageService } from "./PackageService.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

export class Store {
  static #compilerInstanceCache = new Map<string, typeof ts>();
  static #fetcher: Fetcher;
  static #lockService: LockService;
  static #manifest: Manifest | undefined;
  static #manifestService: ManifestService;
  static #packageService: PackageService;
  static #npmRegistry = environmentOptions.npmRegistry;
  static #storePath = environmentOptions.storePath;
  static #supportedTags: Array<string> | undefined;
  static #timeout = environmentOptions.timeout * 1000;

  static {
    Store.#fetcher = new Fetcher(Store.#onDiagnostics, Store.#timeout);
    Store.#lockService = new LockService(Store.#onDiagnostics, Store.#timeout);

    Store.#packageService = new PackageService(Store.#storePath, Store.#fetcher, Store.#lockService);
    Store.#manifestService = new ManifestService(Store.#storePath, Store.#npmRegistry, Store.#fetcher);
  }

  static async getSupportedTags(): Promise<Array<string> | undefined> {
    await Store.open();

    return Store.#supportedTags;
  }

  static async install(tag: string): Promise<void> {
    if (tag === "current") {
      return;
    }

    await Store.open();

    const version = Store.#manifest?.resolve(tag);

    if (!version) {
      Store.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

      return;
    }

    await Store.#packageService.ensure(version, Store.#manifest);
  }

  static async load(tag: string): Promise<typeof ts | undefined> {
    let compilerInstance = Store.#compilerInstanceCache.get(tag);

    if (compilerInstance != null) {
      return compilerInstance;
    }

    let modulePath: string | undefined;

    if (tag === "current" && environmentOptions.typescriptModule != null) {
      modulePath = fileURLToPath(environmentOptions.typescriptModule);
    } else {
      await Store.open();

      const version = Store.#manifest?.resolve(tag);

      if (!version) {
        Store.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

        return;
      }

      compilerInstance = Store.#compilerInstanceCache.get(version);

      if (compilerInstance != null) {
        return compilerInstance;
      }

      const packagePath = await Store.#packageService.ensure(version, Store.#manifest);

      if (packagePath != null) {
        modulePath = Path.join(packagePath, "lib", "typescript.js");
      }
    }

    if (modulePath != null) {
      compilerInstance = await Store.#loadModule(modulePath);

      Store.#compilerInstanceCache.set(tag, compilerInstance);
      Store.#compilerInstanceCache.set(compilerInstance.version, compilerInstance);
    }

    return compilerInstance;
  }

  static async #loadModule(modulePath: string) {
    const exports = {};
    const module = { exports };

    const packageConfigText = await fs.readFile(Path.resolve(modulePath, "../../package.json"), { encoding: "utf8" });
    const { version: packageVersion } = JSON.parse(packageConfigText) as { version: string };

    // project service was moved to 'typescript.js' file since TypeScript 5.3
    if (!Version.isSatisfiedWith(packageVersion, "5.3")) {
      modulePath = Path.resolve(modulePath, "../tsserverlibrary.js");
    }

    const sourceText = await fs.readFile(modulePath, { encoding: "utf8" });

    const toExpose: Array<string> = [];

    // 'isApplicableIndexType()' was added since TypeScript 4.4
    if (Version.isSatisfiedWith(packageVersion, "4.4")) {
      toExpose.push("isApplicableIndexType");
    }

    // 'getTypeOfSymbol()' was exposed since TypeScript 4.6
    if (!Version.isSatisfiedWith(packageVersion, "4.6")) {
      toExpose.push("getTypeOfSymbol");
    }

    toExpose.push(
      "isTypeRelatedTo",
      "relation: { assignable: assignableRelation, identity: identityRelation, subtype: strictSubtypeRelation }",
    );

    const modifiedSourceText = sourceText.replace("return checker;", `return { ...checker, ${toExpose.join(", ")} };`);

    const compiledWrapper = vm.compileFunction(
      modifiedSourceText,
      ["exports", "require", "module", "__filename", "__dirname"],
      { filename: modulePath },
    );

    compiledWrapper(exports, createRequire(modulePath), module, modulePath, Path.dirname(modulePath));

    return module.exports as typeof ts;
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["store:error", { diagnostics: [diagnostic] }]);
  }

  static async open(): Promise<void> {
    // ensure '.open()' can only be called once
    Store.open = () => Promise.resolve();

    Store.#manifest = await Store.#manifestService.open();

    if (Store.#manifest != null) {
      Store.#supportedTags = [
        ...Object.keys(Store.#manifest.resolutions),
        ...Store.#manifest.versions,
        "current",
      ].sort();
    }
  }

  static async prune(): Promise<void> {
    await Store.#manifestService.prune();
  }

  static async update(): Promise<void> {
    await Store.#manifestService.open({ refresh: true });
  }

  static async validateTag(tag: string): Promise<boolean | undefined> {
    if (tag === "current") {
      return environmentOptions.typescriptModule != null;
    }

    await Store.open();

    if (
      Store.#manifest?.isOutdated({ ageTolerance: 60 /* one minute */ }) &&
      (!Version.isVersionTag(tag) ||
        (Store.#manifest.resolutions["latest"] != null &&
          Version.isGreaterThan(tag, Store.#manifest.resolutions["latest"])))
    ) {
      Store.#onDiagnostics(
        Diagnostic.warning([
          StoreDiagnosticText.failedToUpdateMetadata(Store.#npmRegistry),
          StoreDiagnosticText.maybeOutdatedResolution(tag),
        ]),
      );
    }

    return Store.#supportedTags?.includes(tag);
  }
}
