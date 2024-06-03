import { existsSync } from "node:fs";
import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";
import { Environment } from "#environment";
import type { StoreService } from "#store";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import { OptionUsageText } from "./OptionUsageText.js";
import type { OptionBrand, OptionGroup } from "./enums.js";

export class OptionValidator {
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #optionGroup: OptionGroup;
  #optionUsageText: OptionUsageText;
  #storeService: StoreService;

  constructor(optionGroup: OptionGroup, storeService: StoreService, onDiagnostic: (diagnostic: Diagnostic) => void) {
    this.#optionGroup = optionGroup;
    this.#storeService = storeService;
    this.#onDiagnostic = onDiagnostic;

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
      case "rootPath": {
        if (!existsSync(optionValue)) {
          this.#onDiagnostic(Diagnostic.error(OptionDiagnosticText.fileDoesNotExist(optionValue), origin));
        }
        break;
      }

      case "target": {
        if ((await this.#storeService.validateTag(optionValue)) === false) {
          this.#onDiagnostic(
            Diagnostic.error(
              [
                OptionDiagnosticText.versionIsNotSupported(optionValue),
                ...(await this.#optionUsageText.get(optionName, optionBrand)),
              ],
              origin,
            ),
          );
        }
        break;
      }

      case "testFileMatch": {
        for (const segment of ["/", "../"]) {
          if (optionValue.startsWith(segment)) {
            this.#onDiagnostic(Diagnostic.error(OptionDiagnosticText.testFileMatchCannotStartWith(segment), origin));
          }
        }
        break;
      }

      case "watch": {
        if (Environment.isCi) {
          this.#onDiagnostic(Diagnostic.error(OptionDiagnosticText.watchCannotBeEnabledInCiEnvironment(), origin));
        }
        break;
      }

      default:
        break;
    }
  }
}
