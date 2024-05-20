import { OptionBrand, OptionGroup } from "./enums.js";

export interface ItemDefinition {
  brand: OptionBrand.String;
  name: string;
  pattern?: string;
}

export type OptionDefinition = PrimitiveTypeOptionDefinition | ListTypeOptionDefinition;

export type OptionValue = Array<OptionValue> | string | number | boolean | null | undefined;

interface BaseOptionDefinition {
  brand: OptionBrand;
  description: string;
  group: OptionGroup;
  name: string;
}

interface PrimitiveTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.String | OptionBrand.Number | OptionBrand.Boolean | OptionBrand.True;
}

interface ListTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.List;
  items: ItemDefinition;
}

export class OptionDefinitionsMap {
  static #definitions: Array<OptionDefinition> = [
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
      description: "Print the list of command line options with brief descriptions and exit.",
      group: OptionGroup.CommandLine,
      name: "help",
    },

    {
      brand: OptionBrand.True,
      description: "Install specified versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "install",
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
      brand: OptionBrand.List,
      description: "The list of TypeScript versions to be tested on.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile,
      items: {
        brand: OptionBrand.String,
        name: "target",
        pattern: "^([45]\\.[0-9](\\.[0-9])?)|beta|current|latest|next|rc$",
      },
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

    for (const definition of OptionDefinitionsMap.#definitions) {
      if (definition.group & optionGroup) {
        definitionMap.set(definition.name, definition);
      }
    }

    return definitionMap;
  }
}
