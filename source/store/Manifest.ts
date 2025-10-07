export interface ManifestData {
  $version?: string;
  lastUpdated?: number;
  minorVersions: Array<string>;
  npmRegistry: string;
  packages: Record<string, { integrity: string; tarball: string }>;
  resolutions: Record<string, string>;
  versions: Array<string>;
}

export class Manifest {
  static #version = "3";

  $version: string;
  lastUpdated: number;
  minorVersions: Array<string>;
  npmRegistry: string;
  packages: Record<string, { integrity: string; tarball: string }>;
  resolutions: Record<string, string>;
  versions: Array<string>;

  constructor(data: ManifestData) {
    this.$version = data.$version ?? Manifest.#version;
    this.lastUpdated = data.lastUpdated ?? Date.now();
    this.minorVersions = data.minorVersions;
    this.npmRegistry = data.npmRegistry;
    this.packages = data.packages;
    this.resolutions = data.resolutions;
    this.versions = data.versions;
  }

  isOutdated(options?: { ageTolerance?: number }): boolean {
    if (Date.now() - this.lastUpdated > 2 * 60 * 60 * 1000 /* 2 hours */ + (options?.ageTolerance ?? 0) * 1000) {
      return true;
    }

    return false;
  }

  static parse(text: string): Manifest | undefined {
    let manifestData: ManifestData | undefined;

    try {
      manifestData = JSON.parse(text);
    } catch {
      // the manifest will be removed and recreated by the service logic
    }

    if (manifestData != null && manifestData.$version === Manifest.#version) {
      return new Manifest(manifestData);
    }

    return;
  }

  resolve(tag: string): string | undefined {
    if (tag === "*") {
      return this.resolutions["latest"];
    }

    if (this.versions.includes(tag)) {
      return tag;
    }

    return this.resolutions[tag];
  }

  stringify(): string {
    const manifestData: Required<ManifestData> = {
      $version: this.$version,
      lastUpdated: this.lastUpdated,
      minorVersions: this.minorVersions,
      npmRegistry: this.npmRegistry,
      packages: this.packages,
      resolutions: this.resolutions,
      versions: this.versions,
    };

    return JSON.stringify(manifestData);
  }
}
