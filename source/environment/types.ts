export interface EnvironmentOptions {
  fetchRetries: number;
  fetchTimeout: number;
  isCi: boolean;
  noColor: boolean;
  noInteractive: boolean;
  npmRegistry: string;
  storePath: string;
  typescriptSpecifier: string | undefined;
}
