import { existsSync } from "node:fs";
import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";
import type { StoreService } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import type { OptionBrand } from "./OptionBrand.enum.js";
import type { OptionGroup } from "./OptionGroup.enum.js";
import { OptionUsageText } from "./OptionUsageText.js";
import { environmentOptions } from "./environmentOptions.js";
import type { DiagnosticsHandler } from "./types.js";

export class OptionValidator {
  #onDiagnostics: DiagnosticsHandler;
  #optionGroup: OptionGroup;
  #optionUsageText: OptionUsageText;
  #storeService: StoreService;

  constructor(optionGroup: OptionGroup, storeService: StoreService, onDiagnostics: DiagnosticsHandler) {
    this.#optionGroup = optionGroup;
    this.#storeService = storeService;
    this.#onDiagnostics = onDiagnostics;

    this.#optionUsageText = new OptionUsageText(this.#optionGroup, this.#storeService);
  }

  async check(
    optionName: string,
    optionValue: string,
    optionBrand: OptionBrand,
    origin?: DiagnosticOrigin,
  ): Promise<void> {
    switch (optionName) {
      case "config":
      case "rootPath":
        if (!existsSync(optionValue)) {
          this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.fileDoesNotExist(optionValue), origin));
        }
        break;

      case "target":
        if ((await this.#storeService.validateTag(optionValue)) === false) {
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
