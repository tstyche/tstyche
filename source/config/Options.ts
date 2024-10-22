import { OptionBrand } from "./OptionBrand.enum.js";
import { OptionGroup } from "./OptionGroup.enum.js";

export interface ItemDefinition {
  brand: OptionBrand.String;
  name: string;
  pattern?: string;
}

export type OptionDefinition = PrimitiveTypeOptionDefinition | ListTypeOptionDefinition;

interface BaseOptionDefinition {
  brand: OptionBrand;
  description: string;
  group: OptionGroup;
  name: string;
}

interface PrimitiveTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.String | OptionBrand.Number | OptionBrand.Boolean | OptionBrand.BareTrue;
}

interface ListTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.List;
  items: ItemDefinition;
}

export class Options {
  static #definitions: Array<OptionDefinition> = [
    {
      brand: OptionBrand.String,
      description: "The Url to the config file validation schema.",
      group: OptionGroup.ConfigFile,
      name: "$schema",
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
      brand: OptionBrand.BareTrue,
      description: "Print the list of command line options with brief descriptions and exit.",
      group: OptionGroup.CommandLine,
      name: "help",
    },

    {
      brand: OptionBrand.BareTrue,
      description: "Install specified versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "install",
    },

    {
      brand: OptionBrand.BareTrue,
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
      brand: OptionBrand.List,
      description: "The list of plugins to use.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile,
      items: {
        brand: OptionBrand.String,
        name: "plugins",
      },
      name: "plugins",
    },

    {
      brand: OptionBrand.BareTrue,
      description: "Remove all installed versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "prune",
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
      group: OptionGroup.ConfigFile,
      name: "rootPath",
    },

    {
      brand: OptionBrand.BareTrue,
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
      brand: OptionBrand.String,
      description: "The path to a custom TSConfig file.",
      group: OptionGroup.CommandLine | OptionGroup.ConfigFile,
      name: "tsconfig",
    },

    {
      brand: OptionBrand.BareTrue,
      description: "Fetch the 'typescript' package metadata from the registry and exit.",
      group: OptionGroup.CommandLine,
      name: "update",
    },

    {
      brand: OptionBrand.BareTrue,
      description: "Print the version number and exit.",
      group: OptionGroup.CommandLine,
      name: "version",
    },

    {
      brand: OptionBrand.BareTrue,
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
}
