import fs from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { type Manifest, ManifestWorker } from "./ManifestWorker.js";
import { PackageInstaller } from "./PackageInstaller.js";

export class StoreService {
  #compilerInstanceCache = new Map<string, typeof ts>();
  #manifest: Manifest | undefined;
  #manifestWorker: ManifestWorker;
  #nodeRequire = createRequire(import.meta.url);
  #packageInstaller: PackageInstaller;
  #storePath: string;

  constructor() {
    this.#storePath = Environment.storePath;

    this.#packageInstaller = new PackageInstaller(this.#storePath, this.#onDiagnostic);
    this.#manifestWorker = new ManifestWorker(this.#storePath, this.#onDiagnostic, this.prune);
  }

  async getSupportedTags(signal?: AbortSignal): Promise<Array<string>> {
    await this.open(signal);

    if (!this.#manifest) {
      return [];
    }

    return [...Object.keys(this.#manifest.resolutions), ...this.#manifest.versions, "current"].sort();
  }

  async install(tag: string, signal?: AbortSignal): Promise<string | undefined> {
    if (tag === "current") {
      return;
    }

    const version = await this.resolveTag(tag, signal);

    if (version == null) {
      this.#onDiagnostic(Diagnostic.error(`Cannot add the 'typescript' package for the '${tag}' tag.`));

      return;
    }

    return this.#packageInstaller.ensure(version, signal);
  }

  async load(tag: string, signal?: AbortSignal): Promise<typeof ts | undefined> {
    let compilerInstance = this.#compilerInstanceCache.get(tag);

    if (compilerInstance != null) {
      return compilerInstance;
    }

    let modulePath: string | undefined;

    if (tag === "current") {
      try {
        // TODO use 'import.meta.resolve()' after dropping support for Node.js 16
        modulePath = this.#nodeRequire.resolve("typescript");
      } catch (error) {
        this.#onDiagnostic(
          Diagnostic.fromError(
            "Failed to resolve locally installed 'typescript' package. It might be not installed.",
            error,
          ),
        );
      }
    }

    if (modulePath == null) {
      if (tag === "current") {
        return;
      }

      const version = await this.resolveTag(tag, signal);

      if (version == null) {
        this.#onDiagnostic(Diagnostic.error(`Cannot add the 'typescript' package for the '${tag}' tag.`));

        return;
      }

      compilerInstance = this.#compilerInstanceCache.get(version);

      if (compilerInstance != null) {
        return compilerInstance;
      }

      modulePath = await this.#packageInstaller.ensure(version, signal);
    }

    if (modulePath != null) {
      compilerInstance = await this.#loadModule(modulePath);

      this.#compilerInstanceCache.set(tag, compilerInstance);
      this.#compilerInstanceCache.set(compilerInstance.version, compilerInstance);

      return compilerInstance;
    }

    return;
  }

  async #loadModule(modulePath: string) {
    const exports = {};
    const require = createRequire(modulePath);
    const module = { exports };

    let sourceText = await fs.readFile(modulePath, { encoding: "utf8" });
    sourceText = sourceText.replace("isTypeAssignableTo,", "isTypeAssignableTo, isTypeIdenticalTo, isTypeSubtypeOf,");

    const compiledWrapper = vm.compileFunction(
      sourceText,
      ["exports", "require", "module", "__filename", "__dirname"],
      { filename: modulePath },
    );

    compiledWrapper(exports, require, module, modulePath, Path.dirname(modulePath));

    return module.exports as typeof ts;
  }

  #onDiagnostic = (diagnostic: Diagnostic) => {
    EventEmitter.dispatch(["store:error", { diagnostics: [diagnostic] }]);
  };

  async open(signal?: AbortSignal): Promise<void> {
    if (this.#manifest) {
      return;
    }

    this.#manifest = await this.#manifestWorker.open(signal);
  }

  prune = async (): Promise<void> => {
    await fs.rm(this.#storePath, { force: true, recursive: true });
  };

  async resolveTag(tag: string, signal?: AbortSignal): Promise<string | undefined> {
    if (tag === "current") {
      return tag;
    }

    await this.open(signal);

    if (!this.#manifest) {
      return;
    }

    if (this.#manifest.versions.includes(tag)) {
      return tag;
    }

    const version = this.#manifest.resolutions[tag];

    if (
      this.#manifestWorker.isOutdated(this.#manifest, /* ageTolerance */ 60 /* one minute */) &&
      Object.keys(this.#manifest.resolutions).slice(-5).includes(tag)
    ) {
      this.#onDiagnostic(
        Diagnostic.warning([
          "Failed to update metadata of the 'typescript' package from the registry.",
          `The resolution of the '${tag}' tag may be outdated.`,
        ]),
      );
    }

    return version;
  }

  async update(signal?: AbortSignal): Promise<void> {
    await this.#manifestWorker.open(signal, { refresh: true });
  }

  async validateTag(tag: string, signal?: AbortSignal): Promise<boolean> {
    if (tag === "current") {
      return true;
    }

    await this.open(signal);

    if (!this.#manifest) {
      return false;
    }

    if (this.#manifest.versions.includes(tag) || tag in this.#manifest.resolutions || tag === "current") {
      return true;
    }

    if (
      this.#manifest.resolutions["latest"] != null &&
      tag.startsWith(this.#manifest.resolutions["latest"].slice(0, 3))
    ) {
      this.#onDiagnostic(
        Diagnostic.warning([
          "Failed to update metadata of the 'typescript' package from the registry.",
          `The resolution of the '${tag}' tag may be outdated.`,
        ]),
      );
    }

    return false;
  }
}
