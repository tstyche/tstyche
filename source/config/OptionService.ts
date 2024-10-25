import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { Diagnostic, type DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { environmentOptions } from "#environment";
import { Path } from "#path";
import { Store } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import type { OptionGroup } from "./OptionGroup.enum.js";
import type { ItemDefinition, OptionDefinition } from "./Options.js";

export class OptionService {
  static resolve(optionName: string, optionValue: string, rootPath = "."): string {
    switch (optionName) {
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: shared validation logic
      case "tsconfig":
        if (["findup", "ignore"].includes(optionValue)) {
          break;
        }

      case "config":
      case "rootPath":
        optionValue = Path.resolve(rootPath, optionValue);
        break;

      case "plugins":
      case "reporters":
        if (optionValue.startsWith(".")) {
          optionValue = pathToFileURL(Path.join(Path.relative(".", rootPath), optionValue)).toString();
        }
        break;
    }

    return optionValue;
  }

  static async validate(
    optionDefinition: OptionDefinition | ItemDefinition,
    optionValue: string,
    optionGroup: OptionGroup,
    onDiagnostics: DiagnosticsHandler,
    origin?: DiagnosticOrigin,
  ): Promise<void> {
    switch (optionDefinition.name) {
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: shared validation logic
      case "tsconfig":
        if (["findup", "ignore"].includes(optionValue)) {
          break;
        }

      case "config":
      case "rootPath":
        if (!existsSync(optionValue)) {
          onDiagnostics(Diagnostic.error(ConfigDiagnosticText.fileDoesNotExist(optionValue), origin));
        }
        break;

      // biome-ignore lint/suspicious/noFallthroughSwitchClause: shared validation logic
      case "reporters":
        if (["list", "summary"].includes(optionValue)) {
          break;
        }

      case "plugins":
        try {
          await import(optionValue);
        } catch {
          onDiagnostics(Diagnostic.error(ConfigDiagnosticText.moduleWasNotFound(optionValue), origin));
        }
        break;

      case "target":
        if ((await Store.validateTag(optionValue)) === false) {
          onDiagnostics(
            Diagnostic.error(
              [
                ConfigDiagnosticText.versionIsNotSupported(optionValue),
                await ConfigDiagnosticText.usage(optionDefinition.name, optionDefinition.brand, optionGroup),
              ].flat(),
              origin,
            ),
          );
        }
        break;

      case "testFileMatch":
        for (const segment of ["/", "../"]) {
          if (optionValue.startsWith(segment)) {
            onDiagnostics(Diagnostic.error(ConfigDiagnosticText.testFileMatchCannotStartWith(segment), origin));
          }
        }
        break;

      case "watch":
        if (environmentOptions.isCi) {
          onDiagnostics(Diagnostic.error(ConfigDiagnosticText.watchCannotBeEnabled(), origin));
        }
        break;
    }
  }
}
