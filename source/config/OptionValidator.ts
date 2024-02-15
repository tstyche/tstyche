import { existsSync } from "node:fs";
import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";
import type { StoreService } from "#store";
import type { OptionBrand, OptionGroup } from "./enums.js";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import { OptionUsageText } from "./OptionUsageText.js";

export class OptionValidator {
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #optionDiagnosticText: OptionDiagnosticText;
  #optionGroup: OptionGroup;
  #optionUsageText: OptionUsageText;
  #storeService: StoreService;

  constructor(optionGroup: OptionGroup, storeService: StoreService, onDiagnostic: (diagnostic: Diagnostic) => void) {
    this.#optionGroup = optionGroup;
    this.#storeService = storeService;
    this.#onDiagnostic = onDiagnostic;

    this.#optionDiagnosticText = new OptionDiagnosticText(this.#optionGroup);
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
          const text = [this.#optionDiagnosticText.fileDoesNotExist(optionValue)];

          this.#onDiagnostic(Diagnostic.error(text, origin));
        }
        break;

      case "target":
        if (!(await this.#storeService.validateTag(optionValue))) {
          this.#onDiagnostic(
            Diagnostic.error(
              [
                this.#optionDiagnosticText.versionIsNotSupported(optionValue),
                ...(await this.#optionUsageText.get(optionName, optionBrand)),
              ],
              origin,
            ),
          );
        }
        break;

      default:
        break;
    }
  }
}
