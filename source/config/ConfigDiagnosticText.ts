import { OptionBrand } from "./OptionBrand.enum.js";

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

  static fileMatchPatternCannotStartWith(optionName: string, segment: string): Array<string> {
    return [
      `A '${optionName}' pattern cannot start with '${segment}'.`,
      "The files are only collected within the 'rootPath' directory.",
    ];
  }

  static inspectSupportedVersions(): string {
    return "Use the '--list' command line option to inspect the list of supported versions.";
  }

  static moduleWasNotFound(specifier: string): string {
    return `The specified module '${specifier}' was not found.`;
  }

  static optionValueMustBe(optionName: string, optionBrand: OptionBrand): string {
    if (optionBrand === OptionBrand.SemverRange) {
      optionBrand = OptionBrand.String;
    }

    return `Value for the '${optionName}' option must be a ${optionBrand}.`;
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

  static seen(element: string): string {
    return `The ${element} was seen here.`;
  }

  static unexpected(element: string): string {
    return `Unexpected ${element}.`;
  }

  static unknownOption(optionName: string): string {
    return `Unknown option '${optionName}'.`;
  }

  static versionIsNotSupported(value: string): string {
    return `TypeScript version '${value}' is not supported.`;
  }

  static watchCannotBeEnabled(): string {
    return "Watch mode cannot be enabled in continuous integration environment.";
  }
}
