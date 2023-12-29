import path from "node:path";
import { Diagnostic } from "#diagnostic";
import type { StoreService } from "#store";
import { OptionBrand } from "./OptionBrand.js";
import { type OptionDefinition, OptionDefinitionsMap, type OptionValue } from "./OptionDefinitionsMap.js";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import { OptionGroup } from "./OptionGroup.js";
import { OptionUsageText } from "./OptionUsageText.js";
import { OptionValidator } from "./OptionValidator.js";

export type { CommandLineOptions } from "../../lib/CommandLineOptions.js";

export class CommandLineOptionsWorker {
  #commandLineOptionDefinitions: Map<string, OptionDefinition>;
  #commandLineOptions: Record<string, OptionValue>;
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #optionDiagnosticText: OptionDiagnosticText;
  #optionUsageText: OptionUsageText;
  #optionValidator: OptionValidator;
  #pathMatch: Array<string>;
  #storeService: StoreService;

  constructor(
    commandLineOptions: Record<string, OptionValue>,
    pathMatch: Array<string>,
    storeService: StoreService,
    onDiagnostic: (diagnostic: Diagnostic) => void,
  ) {
    this.#commandLineOptions = commandLineOptions;
    this.#pathMatch = pathMatch;
    this.#storeService = storeService;
    this.#onDiagnostic = onDiagnostic;

    this.#commandLineOptionDefinitions = OptionDefinitionsMap.for(OptionGroup.CommandLine);

    this.#optionDiagnosticText = new OptionDiagnosticText(OptionGroup.CommandLine);
    this.#optionUsageText = new OptionUsageText(OptionGroup.CommandLine, this.#storeService);

    this.#optionValidator = new OptionValidator(OptionGroup.CommandLine, this.#storeService, this.#onDiagnostic);
  }

  #normalizePath(filePath: string) {
    if (path.sep === "/") {
      return filePath;
    }

    return filePath.replaceAll("\\", "/");
  }

  #onExpectsArgumentDiagnostic(optionDefinition: OptionDefinition) {
    const text = [
      this.#optionDiagnosticText.expectsArgument(optionDefinition.name),
      ...this.#optionUsageText.get(optionDefinition.name, optionDefinition.brand),
    ];

    this.#onDiagnostic(Diagnostic.error(text));
  }

  parse(commandLineArgs: Array<string>): void {
    let index = 0;
    let arg = commandLineArgs[index];

    while (arg !== undefined) {
      index++;

      if (arg.startsWith("--")) {
        const optionName = arg.slice(2);
        const optionDefinition = this.#commandLineOptionDefinitions.get(optionName);

        if (optionDefinition) {
          index = this.#parseOptionValue(commandLineArgs, index, optionDefinition);
        } else {
          this.#onDiagnostic(Diagnostic.error(this.#optionDiagnosticText.unknownOption(arg)));
        }
      } else if (arg.startsWith("-")) {
        this.#onDiagnostic(Diagnostic.error(this.#optionDiagnosticText.unknownOption(arg)));
      } else {
        this.#pathMatch.push(arg);
      }

      arg = commandLineArgs[index];
    }
  }

  #parseOptionValue(commandLineArgs: Array<string>, index: number, optionDefinition: OptionDefinition) {
    let optionValue = this.#resolveOptionValue(commandLineArgs[index]);

    switch (optionDefinition.brand) {
      case OptionBrand.Boolean:
        this.#commandLineOptions[optionDefinition.name] = optionValue !== "false";

        if (optionValue === "false" || optionValue === "true") {
          index++;
        }
        break;

      case OptionBrand.List:
        if (optionValue != null) {
          const optionValues = optionValue
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value !== ""); // in case if a comma was at the end of a list, e.g. "--target 5.0,latest,"

          for (const optionValue of optionValues) {
            this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);
          }

          this.#commandLineOptions[optionDefinition.name] = optionValues;
          index++;
          break;
        }

        this.#onExpectsArgumentDiagnostic(optionDefinition);
        break;

      case OptionBrand.Number:
        if (optionValue != null) {
          this.#commandLineOptions[optionDefinition.name] = Number(optionValue);
          index++;
          break;
        }

        this.#onExpectsArgumentDiagnostic(optionDefinition);
        break;

      case OptionBrand.String:
        if (optionValue != null) {
          if (optionDefinition.name === "config") {
            optionValue = this.#normalizePath(path.resolve(optionValue));
          }

          this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);

          this.#commandLineOptions[optionDefinition.name] = optionValue;

          index++;
          break;
        }

        this.#onExpectsArgumentDiagnostic(optionDefinition);
        break;

      default:
        break;
    }

    return index;
  }

  #resolveOptionValue(optionValue: string | undefined) {
    if (optionValue == null || optionValue.startsWith("-")) {
      return;
    }

    return optionValue;
  }
}
