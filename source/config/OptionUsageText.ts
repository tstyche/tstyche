import type { StoreService } from "#store";
import { type OptionBrand, OptionGroup } from "./enums.js";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import { Previews } from "./Previews.js";

export class OptionUsageText {
  #optionDiagnosticText: OptionDiagnosticText;
  #optionGroup: OptionGroup;
  #storeService: StoreService;

  constructor(optionGroup: OptionGroup, storeService: StoreService) {
    this.#optionGroup = optionGroup;
    this.#optionDiagnosticText = new OptionDiagnosticText(this.#optionGroup);
    this.#storeService = storeService;
  }

  async get(optionName: string, optionBrand: OptionBrand): Promise<Array<string>> {
    const usageText: Array<string> = [];

    switch (optionName) {
      case "previewFeatures": {
        const supportedPreviewFeatures = Previews.getSupportedFeatures();
        const supportedPreviewFeaturesText = `Supported preview features: ${
          ["'", supportedPreviewFeatures.join("', '"), "'"].join("")
        }.`;

        usageText.push(
          "Item of the 'previewFeatures' list must be a name of a supported preview feature.",
          supportedPreviewFeaturesText,
        );

        break;
      }

      case "target": {
        const supportedTags = await this.#storeService.getSupportedTags();
        const supportedTagsText = `Supported tags: ${["'", supportedTags.join("', '"), "'"].join("")}.`;

        switch (this.#optionGroup) {
          case OptionGroup.CommandLine:
            usageText.push(
              "Argument for the '--target' option must be a single tag or a comma separated list.",
              "Usage examples: '--target 4.9', '--target latest', '--target 4.9,5.3.2,current'.",
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
