import { Store } from "#store";
import type { OptionBrand } from "./OptionBrand.enum.js";
import { OptionGroup } from "./OptionGroup.enum.js";

export class ConfigDiagnosticText {
  static expected(element: string): string {
    return `Expected ${element}.`;
  }

  static expectsListItemType(optionName: string, optionBrand: OptionBrand): string {
    return `Item of the '${optionName}' list must be of type ${optionBrand}.`;
  }

  static expectsValue(optionName: string, optionGroup: OptionGroup): string {
    optionName = ConfigDiagnosticText.#optionName(optionName, optionGroup);

    return `Option '${optionName}' expects a value.`;
  }

  static fileDoesNotExist(filePath: string): string {
    return `The specified path '${filePath}' does not exist.`;
  }

  static moduleWasNotFound(specifier: string): string {
    return `The specified module '${specifier}' was not found.`;
  }

  static #optionName(optionName: string, optionGroup: OptionGroup) {
    switch (optionGroup) {
      case OptionGroup.CommandLine:
        return `--${optionName}`;

      case OptionGroup.ConfigFile:
        return optionName;
    }
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

  static requiresValueType(optionName: string, optionBrand: OptionBrand, optionGroup: OptionGroup): string {
    const optionNameText = ConfigDiagnosticText.#optionName(optionName, optionGroup);

    return `Option '${optionNameText}' requires a value of type ${optionBrand}.`;
  }

  static unknownOption(optionName: string): string {
    return `Unknown option '${optionName}'.`;
  }

  static async usage(optionName: string, optionBrand: OptionBrand, optionGroup: OptionGroup): Promise<Array<string>> {
    const text: Array<string> = [];

    switch (optionName) {
      case "target": {
        switch (optionGroup) {
          case OptionGroup.CommandLine:
            text.push(
              "Value for the '--target' option must be a single tag or a comma separated list.",
              "Usage examples: '--target 4.9', '--target latest', '--target 4.9,5.3.2,current'.",
            );
            break;

          case OptionGroup.ConfigFile:
            text.push("Item of the 'target' list must be a supported version tag.");
            break;
        }

        const supportedTags = await Store.getSupportedTags();

        if (supportedTags != null) {
          text.push(`Supported tags: ${["'", supportedTags.join("', '"), "'"].join("")}.`);
        }

        break;
      }

      default:
        text.push(ConfigDiagnosticText.requiresValueType(optionName, optionBrand, optionGroup));
    }

    return text;
  }

  static versionIsNotSupported(value: string): string {
    if (value === "current") {
      return "Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.";
    }

    return `TypeScript version '${value}' is not supported.`;
  }

  static watchCannotBeEnabled(): string {
    return "Watch mode cannot be enabled in continuous integration environment.";
  }
}
