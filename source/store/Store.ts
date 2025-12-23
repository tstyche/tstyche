import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { Version } from "#version";
import { Fetcher } from "./Fetcher.js";
import { LockService } from "./LockService.js";
import type { Manifest } from "./Manifest.js";
import { ManifestService } from "./ManifestService.js";
import { PackageService } from "./PackageService.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";

export class Store {
  static #fetcher: Fetcher;
  static #lockService: LockService;
  static manifest: Manifest | undefined;
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

  static async fetch(tag: string): Promise<void> {
    if (tag === "*" && environmentOptions.typescriptModule != null) {
      return;
    }

    await Store.open();

    const version = Store.manifest?.resolve(tag);

    if (!version) {
      Store.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

      return;
    }

    await Store.#packageService.ensure(version, Store.manifest);
  }

  static async load(tag: string): Promise<typeof ts | undefined> {
    let resolvedModule: string | undefined;

    if (tag === "*" && environmentOptions.typescriptModule != null) {
      resolvedModule = environmentOptions.typescriptModule;
    } else {
      await Store.open();

      const version = Store.manifest?.resolve(tag);

      if (!version) {
        Store.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

        return;
      }

      const packagePath = await Store.#packageService.ensure(version, Store.manifest);

      if (packagePath != null) {
        resolvedModule = import.meta.resolve(`${packagePath}/lib/typescript.js`);
      }
    }

    if (resolvedModule != null) {
      return (await import(resolvedModule)).default;
    }

    return;
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["store:error", { diagnostics: [diagnostic] }]);
  }

  static async open(): Promise<void> {
    // ensure '.open()' can only be called once
    Store.open = () => Promise.resolve();

    Store.manifest = await Store.#manifestService.open();

    if (Store.manifest != null) {
      Store.#supportedTags = [...Object.keys(Store.manifest.resolutions), ...Store.manifest.versions];
    }
  }

  static async prune(): Promise<void> {
    await Store.#manifestService.prune();
  }

  static async update(): Promise<void> {
    await Store.#manifestService.open({ refresh: true });
  }

  static async validateTag(tag: string): Promise<boolean | undefined> {
    if (tag === "*") {
      return true;
    }

    await Store.open();

    if (
      Store.manifest?.isOutdated({ ageTolerance: 60 /* one minute */ }) &&
      (!/^\d/.test(tag) ||
        (Store.manifest.resolutions["latest"] != null &&
          Version.isGreaterThan(tag, Store.manifest.resolutions["latest"])))
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
