import type ts from "typescript";

// #region -- Generated code, to update run: yarn build && mise run generate

export interface CommandLineOptions {
  config?: string;
  failFast?: boolean;
  fetch?: boolean;
  help?: boolean;
  list?: boolean;
  listFiles?: boolean;
  listTasks?: boolean;
  only?: string;
  prune?: boolean;
  quiet?: boolean;
  reporters?: Array<string>;
  root?: string;
  showConfig?: boolean;
  skip?: string;
  target?: Array<string>;
  taskProvider?: string;
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
  target?: Array<string>;
  testFileMatch?: Array<string>;
  tsconfig?: string;
  verbose?: boolean;
}

export interface TaskOptions {
  checkDeclarationFiles?: boolean;
  checkSuppressedErrors?: boolean;
  target?: string;
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
  extends Omit<CommandLineOptions, "config" | "root" | keyof ConfigFileOptions>,
    Required<ConfigFileOptions> {
  configFilePath: string;
  pathMatch: Array<string>;
  rootPath: string;
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

export type TaskList = Array<TaskOptions>;
