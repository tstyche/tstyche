import type { Diagnostic } from "#diagnostic";

export type { ConfigFileOptions } from "../../models/ConfigFileOptions.js";

export type { CommandLineOptions } from "../../models/CommandLineOptions.js";

export type DiagnosticsHandler = (diagnostics: Diagnostic) => void;

export type OptionValue = Array<OptionValue> | string | number | boolean | null | undefined;
