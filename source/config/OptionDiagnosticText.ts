import { type OptionBrand, OptionGroup } from "./enums.js";

export class OptionDiagnosticText {
  #optionGroup: OptionGroup;

  constructor(optionGroup: OptionGroup) {
    this.#optionGroup = optionGroup;
  }

  doubleQuotesExpected(): string {
    return "String literal with double quotes expected.";
  }

  expectsListItemType(optionName: string, optionBrand: OptionBrand): string {
    return `Item of the '${optionName}' list must be of type ${optionBrand}.`;
  }

  expectsValue(optionName: string): string {
    optionName = this.#optionName(optionName);

    return `Option '${optionName}' expects a value.`;
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

  requiresValueType(optionName: string, optionBrand: OptionBrand): string {
    optionName = this.#optionName(optionName);

    return `Option '${optionName}' requires a value of type ${optionBrand}.`;
  }

  unknownOption(optionName: string): string {
    return `Unknown option '${optionName}'.`;
  }

  versionIsNotSupported(value: string): string {
    if (value === "current") {
      return "Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.";
    }

    return `TypeScript version '${value}' is not supported.`;
  }
}
