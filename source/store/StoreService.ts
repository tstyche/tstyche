import fs from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Path } from "#path";
import type { CancellationToken } from "#token";
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

    this.#packageInstaller = new PackageInstaller(this.#storePath, this.#onDiagnostics);
    this.#manifestWorker = new ManifestWorker(this.#storePath, this.#onDiagnostics);
  }

  async getSupportedTags(): Promise<Array<string>> {
    await this.open();

    if (!this.#manifest) {
      return [];
    }

    return [...Object.keys(this.#manifest.resolutions), ...this.#manifest.versions, "current"].sort();
  }

  async install(tag: string, cancellationToken?: CancellationToken): Promise<string | undefined> {
    if (tag === "current") {
      return;
    }

    const version = await this.#resolveTag(tag);

    if (version == null) {
      this.#onDiagnostics(Diagnostic.error(`Cannot add the 'typescript' package for the '${tag}' tag.`));

      return;
    }

    return this.#packageInstaller.ensure(version, cancellationToken);
  }

  async load(tag: string, cancellationToken?: CancellationToken): Promise<typeof ts | undefined> {
    let compilerInstance = this.#compilerInstanceCache.get(tag);

    if (compilerInstance != null) {
      return compilerInstance;
    }

    let modulePath: string | undefined;

    if (tag === "current" && Environment.typescriptPath != null) {
      modulePath = Environment.typescriptPath;
    } else {
      const version = await this.#resolveTag(tag);

      if (version == null) {
        this.#onDiagnostics(Diagnostic.error(`Cannot add the 'typescript' package for the '${tag}' tag.`));

        return;
      }

      compilerInstance = this.#compilerInstanceCache.get(version);

      if (compilerInstance != null) {
        return compilerInstance;
      }

      modulePath = await this.#packageInstaller.ensure(version, cancellationToken);
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

      if (!sourceText.includes("isTypeRelatedTo")) {
        continue;
      }

      const toExpose = [
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

  #onDiagnostics(this: void, diagnostics: Diagnostic | Array<Diagnostic>) {
    diagnostics = Array.isArray(diagnostics) ? diagnostics : [diagnostics];

    EventEmitter.dispatch(["store:error", { diagnostics }]);
  }

  async open(): Promise<void> {
    if (this.#manifest) {
      return;
    }

    this.#manifest = await this.#manifestWorker.open();
  }

  async #resolveTag(tag: string): Promise<string | undefined> {
    await this.open();

    if (!this.#manifest) {
      return;
    }

    if (this.#manifest.versions.includes(tag)) {
      return tag;
    }

    return this.#manifest.resolutions[tag];
  }

  async update(): Promise<void> {
    await this.#manifestWorker.open({ refresh: true });
  }

  async validateTag(tag: string): Promise<boolean | undefined> {
    if (tag === "current") {
      return Environment.typescriptPath != null;
    }

    await this.open();

    if (!this.#manifest) {
      return undefined;
    }

    if (
      this.#manifestWorker.isOutdated(this.#manifest, /* ageTolerance */ 60 /* one minute */) &&
      (!Version.isVersionTag(tag) ||
        (this.#manifest.resolutions["latest"] != null &&
          Version.isGreaterThan(tag, this.#manifest.resolutions["latest"])))
    ) {
      this.#onDiagnostics(
        Diagnostic.warning([
          "Failed to update metadata of the 'typescript' package from the registry.",
          `The resolution of the '${tag}' tag may be outdated.`,
        ]),
      );
    }

    return tag in this.#manifest.resolutions || this.#manifest.versions.includes(tag);
  }
}
