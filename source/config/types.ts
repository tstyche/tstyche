import type ts from "typescript";

// #region -- Generated code, to update run: yarn build && mise run generate

export interface CommandLineOptions {
  config?: string;
  failFast?: boolean;
  fetch?: boolean;
  help?: boolean;
  list?: boolean;
  listFiles?: boolean;
  only?: string;
  prune?: boolean;
  quiet?: boolean;
  reporters?: Array<string>;
  root?: string;
  showConfig?: boolean;
  skip?: string;
  target?: Array<string>;
  tsconfig?: string;
  update?: boolean;
  verbose?: boolean;
  version?: boolean;
  watch?: boolean;
}

export interface ConfigFileOptions {
  checkDeclarationFiles?: boolean;
  checkSuppressedErrors?: boolean;
  failFast?: boolean;
  fixtureFileMatch?: Array<string>;
  quiet?: boolean;
  rejectAnyType?: boolean;
  rejectNeverType?: boolean;
  reporters?: Array<string>;
  rootPath?: string;
  target?: Array<string>;
  testFileMatch?: Array<string>;
  tsconfig?: string;
  verbose?: boolean;
}

// #endregion

export type { OptionValue } from "#json";

export interface InlineConfig {
  fixme?: boolean;
  if?: { target?: Array<string> };
  template?: boolean;
}

export interface ResolvedConfig
  extends Omit<CommandLineOptions, "config" | keyof ConfigFileOptions>,
    Required<ConfigFileOptions> {
  configFilePath: string;
  pathMatch: Array<string>;
}

export interface TextRange {
  start: number;
  end: number;
  text: string;
}

export interface DirectiveRange {
  sourceFile: ts.SourceFile;
  namespace: TextRange;
  directive?: TextRange;
  argument?: TextRange;
}
