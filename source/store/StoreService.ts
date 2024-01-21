import fs from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { Version } from "#version";
import { type Manifest, ManifestWorker } from "./ManifestWorker.js";
import { PackageInstaller } from "./PackageInstaller.js";

export class StoreService {
  #compilerInstanceCache = new Map<string, typeof ts>();
  #manifest: Manifest | undefined;
  #manifestWorker: ManifestWorker;
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

    if (tag === "current" && Environment.typescriptPath != null) {
      modulePath = Environment.typescriptPath;
    } else {
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
    }

    return compilerInstance;
  }

  async #loadModule(modulePath: string) {
    const exports = {};
    const module = { exports };

    const candidatePaths = [Path.join(Path.dirname(modulePath), "tsserverlibrary.js"), modulePath];

    for (const candidatePath of candidatePaths) {
      const sourceText = await fs.readFile(candidatePath, { encoding: "utf8" });

      const modifiedSourceText = sourceText.replace(
        "return checker;",
        "return { ...checker, isTypeIdenticalTo, isTypeSubtypeOf };",
      );

      if (modifiedSourceText.length === sourceText.length) {
        continue;
      }

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

    return this.#manifest.resolutions[tag];
  }

  async update(signal?: AbortSignal): Promise<void> {
    await this.#manifestWorker.open(signal, { refresh: true });
  }

  async validateTag(tag: string, signal?: AbortSignal): Promise<boolean> {
    if (tag === "current") {
      return Environment.typescriptPath != null;
    }

    await this.open(signal);

    if (!this.#manifest) {
      return false;
    }

    if (
      this.#manifestWorker.isOutdated(this.#manifest, /* ageTolerance */ 60 /* one minute */)
      && (!Version.isVersionTag(tag)
        || (this.#manifest.resolutions["latest"] != null
          && Version.isGreaterThan(tag, this.#manifest.resolutions["latest"])))
    ) {
      this.#onDiagnostic(
        Diagnostic.warning([
          "Failed to update metadata of the 'typescript' package from the registry.",
          `The resolution of the '${tag}' tag may be outdated.`,
        ]),
      );
    }

    return this.#manifest.versions.includes(tag) || tag in this.#manifest.resolutions || tag === "current";
  }
}
