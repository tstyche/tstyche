import { type OptionBrand, OptionGroup } from "./enums.js";

export class OptionDiagnosticText {
  static doubleQuotesExpected(): string {
    return "String literal with double quotes expected.";
  }

  static expectsListItemType(optionName: string, optionBrand: OptionBrand): string {
    return `Item of the '${optionName}' list must be of type ${optionBrand}.`;
  }

  static expectsValue(optionName: string, optionGroup: OptionGroup): string {
    optionName = OptionDiagnosticText.#optionName(optionName, optionGroup);

    return `Option '${optionName}' expects a value.`;
  }

  static fileDoesNotExist(filePath: string): string {
    return `The specified path '${filePath}' does not exist.`;
  }

  static #optionName(optionName: string, optionGroup: OptionGroup) {
    switch (optionGroup) {
      case OptionGroup.CommandLine:
        return `--${optionName}`;

      case OptionGroup.ConfigFile:
        return optionName;
    }
  }

  static testFileMatchCannotStartWith(segment: string): Array<string> {
    return [
      `A test file match pattern cannot start with '${segment}'.`,
      "The test files are only collected within the 'rootPath' directory.",
    ];
  }

  static requiresValueType(optionName: string, optionBrand: OptionBrand, optionGroup: OptionGroup): string {
    optionName = OptionDiagnosticText.#optionName(optionName, optionGroup);

    return `Option '${optionName}' requires a value of type ${optionBrand}.`;
  }

  static unknownOption(optionName: string): string {
    return `Unknown option '${optionName}'.`;
  }

  static versionIsNotSupported(value: string): string {
    if (value === "current") {
      return "Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.";
    }

    return `TypeScript version '${value}' is not supported.`;
  }

  static watchCannotBeEnabled(): string {
    return "The watch mode cannot be enabled in a continuous integration environment.";
  }
}
