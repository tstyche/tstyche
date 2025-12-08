export interface EnvironmentOptions {
  isCi: boolean;
  noColor: boolean;
  noInteractive: boolean;
  npmRegistry: string;
  storePath: string;
  timeout: number;
  typescriptModule: string | undefined;
}
