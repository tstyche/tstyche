export interface ManifestData {
  $version?: string;
  lastUpdated?: number;
  npmRegistry: string;
  packages: Record<string, { integrity: string; tarball: string }>;
  resolutions: Record<string, string>;
  versions: Array<string>;
}

export class Manifest {
  static version = "2";

  $version: string;
  lastUpdated: number;
  npmRegistry: string;
  packages: Record<string, { integrity: string; tarball: string }>;
  resolutions: Record<string, string>;
  versions: Array<string>;

  constructor(data: ManifestData) {
    this.$version = data.$version ?? Manifest.version;
    this.lastUpdated = data.lastUpdated ?? Date.now();
    this.npmRegistry = data.npmRegistry;
    this.packages = data.packages;
    this.resolutions = data.resolutions;
    this.versions = data.versions;
  }

  getSupportedTags(): Array<string> {
    return [...Object.keys(this.resolutions), ...this.versions, "current"].sort();
  }

  isOutdated(options?: { ageTolerance?: number }): boolean {
    if (Date.now() - this.lastUpdated > 2 * 60 * 60 * 1000 /* 2 hours */ + (options?.ageTolerance ?? 0) * 1000) {
      return true;
    }

    return false;
  }

  isSupported(tag: string): boolean | undefined {
    return tag in this.resolutions || this.versions.includes(tag);
  }

  static parse(text: string): Manifest | undefined {
    let manifestData: ManifestData | undefined;

    try {
      manifestData = JSON.parse(text) as ManifestData;
    } catch {
      // the manifest will be removed and recreated by the service logic
    }

    if (manifestData != null) {
      return new Manifest(manifestData);
    }

    return;
  }

  resolve(tag: string): string | undefined {
    if (this.versions.includes(tag)) {
      return tag;
    }

    return this.resolutions[tag];
  }

  stringify(): string {
    const manifestData: Required<ManifestData> = {
      $version: this.$version,
      lastUpdated: this.lastUpdated,
      npmRegistry: this.npmRegistry,
      packages: this.packages,
      resolutions: this.resolutions,
      versions: this.versions,
    };

    return JSON.stringify(manifestData);
  }
}
