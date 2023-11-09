import { existsSync } from "node:fs";
import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";
import type { StoreService } from "#store";
import type { OptionBrand } from "./OptionBrand.js";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import type { OptionGroup } from "./OptionGroup.js";
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

  check(optionName: string, optionValue: string, optionBrand: OptionBrand, origin?: DiagnosticOrigin): void {
    switch (optionName) {
      case "config":
      case "rootPath":
        if (!existsSync(optionValue)) {
          const text = [this.#optionDiagnosticText.fileDoesNotExist(optionValue)];

          this.#onDiagnostic(Diagnostic.error(text, origin));
        }
        break;

      case "target":
        {
          if (!this.#storeService.validateTag(optionValue)) {
            this.#onDiagnostic(
              Diagnostic.error(
                [
                  this.#optionDiagnosticText.versionIsNotSupported(optionValue),
                  ...this.#optionUsageText.get(optionName, optionBrand),
                ],
                origin,
              ),
            );
          }
        }
        break;

      default:
        break;
    }
  }
}
