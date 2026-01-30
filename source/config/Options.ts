import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Diagnostic, type DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { environmentOptions } from "#environment";
import { Path } from "#path";
import { Store } from "#store";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import { OptionBrand } from "./OptionBrand.enum.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { Target } from "./Target.js";

interface BaseOptionDefinition {
  brand: OptionBrand;
  description: string;
  group: OptionGroup;
  name: string;
}

interface PrimitiveTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.String | OptionBrand.SemverRange | OptionBrand.Number | OptionBrand.Boolean | OptionBrand.True;
}

export interface ItemDefinition {
  brand: OptionBrand.String;
  name: string;
}

interface ListTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.List;
  items: ItemDefinition;
}

export type OptionDefinition = PrimitiveTypeOptionDefinition | ListTypeOptionDefinition;

export class Options {
  static #definitions: Array<OptionDefinition> = [
    {
      brand: OptionBrand.String,
      description: "The Url to the config file validation schema.",
      group: OptionGroup.ConfigFile,
      name: "$schema",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Check declaration files for type errors.",
      group: OptionGroup.ConfigFile,
      name: "checkDeclarationFiles",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Check errors silenced by '// @ts-expect-error' directives.",
      group: OptionGroup.ConfigFile,
      name: "checkSuppressedErrors",
    },

    {
      brand: OptionBrand.String,
      description: "The path to a TSTyche configuration file.",
      group: OptionGroup.CommandLine,
      name: "config",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Stop running tests after the first failed assertion.",
      group: OptionGroup.ConfigFile | OptionGroup.CommandLine,
      name: "failFast",
    },

    {
      brand: OptionBrand.True,
      description: "Fetch the specified versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "fetch",
    },

    {
      brand: OptionBrand.List,
      description: "The list of glob patterns matching the fixture files.",
      group: OptionGroup.ConfigFile,
      items: {
        brand: OptionBrand.String,
        name: "fixtureFileMatch",
      },
      name: "fixtureFileMatch",
    },

    {
      brand: OptionBrand.True,
      description: "Print the list of command line options with brief descriptions and exit.",
      group: OptionGroup.CommandLine,
      name: "help",
    },

    {
      brand: OptionBrand.True,
      description: "Print the list of supported versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "list",
    },

    {
      brand: OptionBrand.True,
      description: "Print the list of the selected test files and exit.",
      group: OptionGroup.CommandLine,
      name: "listFiles",
    },

    {
      brand: OptionBrand.String,
      description: "Only run tests with matching name.",
      group: OptionGroup.CommandLine,
      name: "only",
    },

    {
      brand: OptionBrand.True,
      description: "Remove all installed versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "prune",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Silence all test runner output except errors and warnings.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile,
      name: "quiet",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Reject the 'any' type passed as an argument to the 'expect()' function or a matcher.",
      group: OptionGroup.ConfigFile,
      name: "rejectAnyType",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Reject the 'never' type passed as an argument to the 'expect()' function or a matcher.",
      group: OptionGroup.ConfigFile,
      name: "rejectNeverType",
    },

    {
      brand: OptionBrand.List,
      description: "The list of reporters to use.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile,
      items: {
        brand: OptionBrand.String,
        name: "reporters",
      },
      name: "reporters",
    },

    {
      brand: OptionBrand.String,
      description: "The path to a directory containing files of a test project.",
      group: OptionGroup.CommandLine,
      name: "root",
    },

    {
      brand: OptionBrand.String,
      description: "The path to a directory containing files of a test project.",
      group: OptionGroup.ConfigFile,
      name: "rootPath",
    },

    {
      brand: OptionBrand.True,
      description: "Print the resolved configuration and exit.",
      group: OptionGroup.CommandLine,
      name: "showConfig",
    },

    {
      brand: OptionBrand.String,
      description: "Skip tests with matching name.",
      group: OptionGroup.CommandLine,
      name: "skip",
    },

    {
      brand: OptionBrand.SemverRange,
      description: "The range of TypeScript versions to be tested against.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile | OptionGroup.InlineConditions,
      name: "target",
    },

    {
      brand: OptionBrand.List,
      description: "The list of glob patterns matching the test files.",
      group: OptionGroup.ConfigFile,
      items: {
        brand: OptionBrand.String,
        name: "testFileMatch",
      },
      name: "testFileMatch",
    },

    {
      brand: OptionBrand.String,
      description: "The look up strategy to be used to find the TSConfig file.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile,
      name: "tsconfig",
    },

    {
      brand: OptionBrand.True,
      description: "Fetch the 'typescript' package metadata from the registry and exit.",
      group: OptionGroup.CommandLine,
      name: "update",
    },

    {
      brand: OptionBrand.True,
      description: "Print the version number and exit.",
      group: OptionGroup.CommandLine,
      name: "version",
    },

    {
      brand: OptionBrand.True,
      description: "Watch for changes and rerun related test files.",
      group: OptionGroup.CommandLine,
      name: "watch",
    },
  ];

  static for(optionGroup: OptionGroup): Map<string, OptionDefinition> {
    const definitionMap = new Map<string, OptionDefinition>();

    for (const definition of Options.#definitions) {
      if (definition.group & optionGroup) {
        definitionMap.set(definition.name, definition);
      }
    }

    return definitionMap;
  }

  static #getCanonicalOptionName(optionName: string) {
    return optionName.startsWith("--") ? optionName.slice(2) : optionName;
  }

  static #isBuiltinReporter(optionValue: string) {
    return ["dot", "list", "summary"].includes(optionValue);
  }

  static #isLookupStrategy(optionValue: string) {
    return ["findup", "ignore"].includes(optionValue);
  }

  static resolve(optionName: string, optionValue: string, rootPath = "."): string {
    const canonicalOptionName = Options.#getCanonicalOptionName(optionName);

    switch (canonicalOptionName) {
      case "config":
      case "root":
      case "rootPath":
      case "tsconfig":
        if (canonicalOptionName === "tsconfig" && Options.#isLookupStrategy(optionValue)) {
          break;
        }

        if (optionValue.startsWith("file:")) {
          optionValue = fileURLToPath(optionValue);
        }

        optionValue = Path.resolve(rootPath, optionValue);
        break;

      case "reporters":
        if (canonicalOptionName === "reporters" && Options.#isBuiltinReporter(optionValue)) {
          break;
        }

        try {
          if (optionValue.startsWith(".")) {
            optionValue = pathToFileURL(Path.relative(".", Path.resolve(rootPath, optionValue))).toString();
          } else {
            optionValue = import.meta.resolve(optionValue);
          }
        } catch {
          // module was not found
        }

        break;
    }

    return optionValue;
  }

  static async validate(
    optionName: string,
    optionValue: string,
    onDiagnostics: DiagnosticsHandler,
    origin?: DiagnosticOrigin,
  ): Promise<void> {
    const canonicalOptionName = Options.#getCanonicalOptionName(optionName);

    switch (canonicalOptionName) {
      case "config":
      case "root":
      case "rootPath":
      case "tsconfig":
        if (canonicalOptionName === "tsconfig" && Options.#isLookupStrategy(optionValue)) {
          break;
        }

        if (existsSync(optionValue)) {
          break;
        }

        onDiagnostics(Diagnostic.error(ConfigDiagnosticText.fileDoesNotExist(optionValue), origin));

        break;

      case "reporters":
        if (canonicalOptionName === "reporters" && Options.#isBuiltinReporter(optionValue)) {
          break;
        }

        if (optionValue.startsWith("file:") && existsSync(new URL(optionValue))) {
          break;
        }

        onDiagnostics(Diagnostic.error(ConfigDiagnosticText.moduleWasNotFound(optionValue), origin));

        break;

      case "target": {
        // maybe a range?
        if (/[<>=]/.test(optionValue)) {
          if (!Target.isRange(optionValue)) {
            const text = [ConfigDiagnosticText.rangeIsNotValid(optionValue), ...ConfigDiagnosticText.rangeUsage()];

            onDiagnostics(Diagnostic.error(text, origin));
          }

          break;
        }

        if ((await Store.validateTag(optionValue)) === false) {
          const text = [
            ConfigDiagnosticText.versionIsNotSupported(optionValue),
            ConfigDiagnosticText.inspectSupportedVersions(),
          ];

          onDiagnostics(Diagnostic.error(text, origin));
        }

        break;
      }

      case "fixtureFileMatch":
      case "testFileMatch":
        for (const segment of ["/", "../"]) {
          if (optionValue.startsWith(segment)) {
            onDiagnostics(
              Diagnostic.error(
                ConfigDiagnosticText.fileMatchPatternCannotStartWith(canonicalOptionName, segment),
                origin,
              ),
            );
          }
        }
        break;

      case "watch":
        if (environmentOptions.isCi) {
          onDiagnostics(Diagnostic.error(ConfigDiagnosticText.watchCannotBeEnabled(), origin));
        }
        break;
    }
  }
}
