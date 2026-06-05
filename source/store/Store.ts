import fs from "node:fs/promises";
import { Diagnostic } from "#diagnostic";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { CompatTypeScript, NativeTypeScript, type TypeScript } from "#typescript";
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
  static #fetchRetries = environmentOptions.fetchRetries;
  static #fetchTimeout = environmentOptions.fetchTimeout * 1000;
  static #storePath = environmentOptions.storePath;
  static #supportedTags: Array<string> | undefined;

  static {
    Store.#fetcher = new Fetcher(Store.#onDiagnostics, Store.#fetchRetries, Store.#fetchTimeout);
    Store.#lockService = new LockService(Store.#onDiagnostics, Store.#fetchTimeout);
    Store.#packageService = new PackageService(Store.#storePath, Store.#fetcher, Store.#lockService);
    Store.#manifestService = new ManifestService(Store.#storePath, Store.#npmRegistry, Store.#fetcher);
  }

  static async #ensure(tag: string) {
    await Store.open({ preview: tag === "preview" });

    const version = Store.manifest?.resolve(tag);

    if (!version) {
      Store.#onDiagnostics(Diagnostic.error(StoreDiagnosticText.cannotAddTypeScriptPackage(tag)));

      return;
    }

    return await Store.#packageService.ensure(version, Store.manifest!);
  }

  static async fetch(tag: string): Promise<void> {
    if (tag === "*" && environmentOptions.typescriptSpecifier != null) {
      return;
    }

    await Store.#ensure(tag);
  }

  static async #getAdapter(specifier: string) {
    const packageJson = await fs.readFile(new URL("package.json", specifier), { encoding: "utf8" });
    const { version } = JSON.parse(packageJson) as { version: string };

    if (Version.isSatisfiedWith(version, "7.0")) {
      return new NativeTypeScript(version);
    }

    const compiler = (await import(new URL("lib/typescript.js", specifier).toString())).default;

    return new CompatTypeScript(compiler, version);
  }

  static async load(tag: string): Promise<TypeScript | undefined> {
    if (tag === "*" && environmentOptions.typescriptSpecifier != null) {
      return Store.#getAdapter(environmentOptions.typescriptSpecifier);
    }

    const specifier = await Store.#ensure(tag);

    if (!specifier) {
      return;
    }

    return Store.#getAdapter(specifier);
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["store:error", { diagnostics: [diagnostic] }]);
  }

  static async open(options?: { preview?: boolean; refresh?: boolean }): Promise<void> {
    if (Store.manifest != null) {
      return;
    }

    Store.manifest = await Store.#manifestService.open({ preview: options?.preview });

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
    if (tag === "*" || tag === "preview") {
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
