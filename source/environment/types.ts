export interface EnvironmentOptions {
  isCi: boolean;
  noColor: boolean;
  noInteractive: boolean;
  noPatch: boolean;
  npmRegistry: string;
  storePath: string;
  timeout: number;
  typescriptModule: string | undefined;
}
