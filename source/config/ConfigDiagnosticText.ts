import type { OptionBrand } from "./OptionBrand.enum.js";

export class ConfigDiagnosticText {
  static expected(element: string): string {
    return `Expected ${element}.`;
  }

  static expectsListItemType(optionName: string, optionBrand: OptionBrand): string {
    return `Item of the '${optionName}' list must be of type ${optionBrand}.`;
  }

  static expectsValue(optionName: string): string {
    return `Option '${optionName}' expects a value.`;
  }

  static fileDoesNotExist(filePath: string): string {
    return `The specified path '${filePath}' does not exist.`;
  }

  static inspectSupportedVersions(): string {
    return "Use the '--list' command line option to inspect the list of supported versions.";
  }

  static moduleWasNotFound(specifier: string): string {
    return `The specified module '${specifier}' was not found.`;
  }

  static rangeIsNotValid(value: string): string {
    return `The specified range '${value}' is not valid.`;
  }

  static rangeUsage(): Array<string> {
    return [
      "A range must be specified using an operator and a minor version.",
      "To set an upper bound, the intersection of two ranges can be used.",
      "Examples: '>=5.5', '>=5.0 <5.3'.",
    ];
  }

  static requiresValueType(optionName: string, optionBrand: OptionBrand): string {
    return `Option '${optionName}' requires a value of type ${optionBrand}.`;
  }

  static seen(element: string): string {
    return `The ${element} was seen here.`;
  }

  static testFileMatchCannotStartWith(segment: string): Array<string> {
    return [
      `A test file match pattern cannot start with '${segment}'.`,
      "The test files are only collected within the 'rootPath' directory.",
    ];
  }

  static unknownOption(optionName: string): string {
    return `Unknown option '${optionName}'.`;
  }

  static usage(optionName: string, optionBrand: OptionBrand): Array<string> {
    switch (optionName.startsWith("--") ? optionName.slice(2) : optionName) {
      case "target": {
        const text: Array<string> = [];

        if (optionName.startsWith("--")) {
          text.push(
            "Value for the '--target' option must be a string or a comma separated list.",
            "Examples: '--target 5.2', '--target next', '--target '>=5.0 <5.3, 5.4.2, >=5.5''.",
          );
        }

        return text;
      }
    }

    return [ConfigDiagnosticText.requiresValueType(optionName, optionBrand)];
  }

  static versionIsNotSupported(value: string): string {
    if (value === "current") {
      return "Cannot use 'current' as a target. Failed to resolve the installed TypeScript module.";
    }

    return `TypeScript version '${value}' is not supported.`;
  }

  static watchCannotBeEnabled(): string {
    return "Watch mode cannot be enabled in continuous integration environment.";
  }
}
