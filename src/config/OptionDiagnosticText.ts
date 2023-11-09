import type { OptionBrand } from "./OptionBrand.js";
import { OptionGroup } from "./OptionGroup.js";

export class OptionDiagnosticText {
  #optionGroup: OptionGroup;

  constructor(optionGroup: OptionGroup) {
    this.#optionGroup = optionGroup;
  }

  doubleQuotesExpected(): string {
    return "String literal with double quotes expected.";
  }

  expectsArgument(optionName: string): string {
    optionName = this.#optionName(optionName);

    return `Option '${optionName}' expects an argument.`;
  }

  expectsListItemType(optionName: string, optionBrand: OptionBrand): string {
    return `Item of the '${optionName}' list must be of type ${optionBrand}.`;
  }

  fileDoesNotExist(filePath: string): string {
    return `The specified path '${filePath}' does not exist.`;
  }

  #optionName(optionName: string) {
    switch (this.#optionGroup) {
      case OptionGroup.CommandLine:
        return `--${optionName}`;

      case OptionGroup.ConfigFile:
        return optionName;
    }
  }

  requiresArgumentType(optionName: string, optionBrand: OptionBrand): string {
    optionName = this.#optionName(optionName);

    return `Option '${optionName}' requires an argument of type ${optionBrand}.`;
  }

  unknownOption(optionName: string): string {
    return `Unknown option '${optionName}'.`;
  }

  unknownProperty(optionName: string): string {
    return `Unknown property '${optionName}'.`;
  }

  versionIsNotSupported(value: string): string {
    return `TypeScript version '${value}' is not supported.`;
  }
}
