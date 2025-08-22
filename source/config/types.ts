// #region -- Generated code, to update run: yarn build && yarn generate

export interface CommandLineOptions {
  config?: string;
  failFast?: boolean;
  fetch?: boolean;
  help?: boolean;
  list?: boolean;
  listFiles?: boolean;
  only?: string;
  plugins?: Array<string>;
  prune?: boolean;
  reporters?: Array<string>;
  showConfig?: boolean;
  skip?: string;
  target?: Array<string>;
  tsconfig?: string;
  update?: boolean;
  version?: boolean;
  watch?: boolean;
}

export interface ConfigFileOptions {
  checkDeclarationFiles?: boolean;
  checkSuppressedErrors?: boolean;
  failFast?: boolean;
  fixtureFileMatch?: Array<string>;
  plugins?: Array<string>;
  rejectAnyType?: boolean;
  rejectNeverType?: boolean;
  reporters?: Array<string>;
  rootPath?: string;
  target?: Array<string>;
  testFileMatch?: Array<string>;
  tsconfig?: string;
}

// #endregion

export type OptionValue = Array<OptionValue> | string | number | boolean | null | undefined;

export interface InlineConfig {
  if?: { target?: Array<string> };
  template?: boolean;
}

export interface ResolvedConfig
  extends Omit<CommandLineOptions, "config" | keyof ConfigFileOptions>,
    Required<ConfigFileOptions> {
  configFilePath: string;
  pathMatch: Array<string>;
}
