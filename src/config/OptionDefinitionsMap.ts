import { OptionBrand } from "./OptionBrand.js";
import { OptionGroup } from "./OptionGroup.js";

export interface ItemDefinition {
  brand: OptionBrand.String | OptionBrand.Object;
  getDefinition?: (optionGroup: OptionGroup) => Map<string, OptionDefinition>;
  name: string;
  nullable?: boolean;
  pattern?: string;
  properties?: Array<OptionDefinition>;
}

export type OptionDefinition = PrimitiveTypeOptionDefinition | ListTypeOptionDefinition | ObjectTypeOptionDefinition;

export type OptionValue =
  | string
  | number
  | boolean
  | Array<OptionValue>
  | { [key: string]: OptionValue }
  | null
  | undefined;

interface BaseOptionDefinition {
  brand: OptionBrand;
  description: string;
  group: OptionGroup;
  name: string;
  nullable?: boolean;
  required?: boolean;
}

interface PrimitiveTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.String | OptionBrand.Number | OptionBrand.Boolean;
}

interface ListTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.List;
  items: ItemDefinition;
}

interface ObjectTypeOptionDefinition extends BaseOptionDefinition {
  brand: OptionBrand.Object;
  getDefinition: (optionGroup: OptionGroup) => Map<string, OptionDefinition>;
  properties: Array<OptionDefinition>;
}

export class OptionDefinitionsMap {
  static #definitions: Array<OptionDefinition> = [
    {
      brand: OptionBrand.Boolean,
      description: "Do not raise an error, if no test files are selected.",
      group: OptionGroup.ConfigFile | OptionGroup.CommandLine,
      name: "allowNoTestFiles",
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
      brand: OptionBrand.Boolean,
      description: "Print the list of command line options with brief descriptions and exit.",
      group: OptionGroup.CommandLine,
      name: "help",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Install specified versions of the 'typescript' package and exit.",
      group: OptionGroup.CommandLine,
      name: "install",
    },

    {
      brand: OptionBrand.Boolean,
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
      brand: OptionBrand.Boolean,
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
      brand: OptionBrand.Boolean,
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
      brand: OptionBrand.Boolean,
      description: "Fetch the 'typescript' package metadata from the registry and exit.",
      group: OptionGroup.CommandLine,
      name: "update",
    },

    {
      brand: OptionBrand.Boolean,
      description: "Print the version number and exit.",
      group: OptionGroup.CommandLine,
      name: "version",
    },
  ];

  static for(optionGroup: OptionGroup): Map<string, OptionDefinition> {
    const definitionMap = new Map<string, OptionDefinition>();

    for (const definition of this.#definitions) {
      if (definition.group & optionGroup) {
        definitionMap.set(definition.name, definition);
      }
    }

    return definitionMap;
  }
}
