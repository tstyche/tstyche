import { existsSync } from "node:fs";
import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";
import { environmentOptions } from "#environment";
import { Store } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import type { OptionBrand } from "./OptionBrand.enum.js";
import type { OptionGroup } from "./OptionGroup.enum.js";
import { OptionUsageText } from "./OptionUsageText.js";
import type { DiagnosticsHandler } from "./types.js";

export class OptionValidator {
  #onDiagnostics: DiagnosticsHandler;
  #optionGroup: OptionGroup;
  #optionUsageText: OptionUsageText;

  constructor(optionGroup: OptionGroup, onDiagnostics: DiagnosticsHandler) {
    this.#optionGroup = optionGroup;
    this.#onDiagnostics = onDiagnostics;

    this.#optionUsageText = new OptionUsageText(this.#optionGroup);
  }

  async check(
    optionName: string,
    optionValue: string,
    optionBrand: OptionBrand,
    origin?: DiagnosticOrigin,
  ): Promise<void> {
    switch (optionName) {
      case "config":
      case "plugins":
      case "rootPath":
        if (!existsSync(optionValue)) {
          this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.fileDoesNotExist(optionValue), origin));
        }
        break;

      case "reporters":
        if (["list", "summary"].includes(optionValue)) {
          break;
        }

        try {
          await import(optionValue);
        } catch {
          this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.moduleWasNotFound(optionValue), origin));
        }
        break;

      case "target":
        if ((await Store.validateTag(optionValue)) === false) {
          this.#onDiagnostics(
            Diagnostic.error(
              [
                ConfigDiagnosticText.versionIsNotSupported(optionValue),
                ...(await this.#optionUsageText.get(optionName, optionBrand)),
              ],
              origin,
            ),
          );
        }
        break;

      case "testFileMatch":
        for (const segment of ["/", "../"]) {
          if (optionValue.startsWith(segment)) {
            this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.testFileMatchCannotStartWith(segment), origin));
          }
        }
        break;

      case "watch":
        if (environmentOptions.isCi) {
          this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.watchCannotBeEnabled(), origin));
        }
        break;
    }
  }
}
