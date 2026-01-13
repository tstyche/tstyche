import type ts from "typescript";

// #region -- Generated code, to update run: yarn build && mise run generate

export interface CommandLineOptions {
  config?: string;
  explainCause?: boolean;
  failFast?: boolean;
  fetch?: boolean;
  help?: boolean;
  list?: boolean;
  listFiles?: boolean;
  only?: string;
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
  rejectAnyType?: boolean;
  rejectNeverType?: boolean;
  reporters?: Array<string>;
  rootPath?: string;
  target?: Array<string>;
  testFileMatch?: Array<string>;
  tsconfig?: string;
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
