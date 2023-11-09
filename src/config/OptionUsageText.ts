import type { StoreService } from "#store";
import type { OptionBrand } from "./OptionBrand.js";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import { OptionGroup } from "./OptionGroup.js";

export class OptionUsageText {
  #optionDiagnosticText: OptionDiagnosticText;
  #optionGroup: OptionGroup;
  #storeService: StoreService;

  constructor(optionGroup: OptionGroup, storeService: StoreService) {
    this.#optionGroup = optionGroup;
    this.#optionDiagnosticText = new OptionDiagnosticText(this.#optionGroup);
    this.#storeService = storeService;
  }

  get(optionName: string, optionBrand: OptionBrand): Array<string> {
    const usageText: Array<string> = [];

    switch (optionName) {
      case "target": {
        const supportedTags = this.#storeService.getSupportedTags();
        const supportedTagsText = `Supported tags: ${["'", supportedTags.join("', '"), "'"].join("")}.`;

        switch (this.#optionGroup) {
          case OptionGroup.CommandLine:
            usageText.push(
              "Argument for the '--target' option must be a single tag or a comma separated list of versions.",
              "Usage examples: '--target 4.9', '--target 5.0.4', '--target 4.7,4.8,latest'.",
              supportedTagsText,
            );
            break;

          case OptionGroup.ConfigFile:
            usageText.push("Item of the 'target' list must be a supported version tag.", supportedTagsText);
            break;
        }
        break;
      }

      default:
        usageText.push(this.#optionDiagnosticText.requiresArgumentType(optionName, optionBrand));
    }

    return usageText;
  }
}
