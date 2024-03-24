import { Diagnostic } from "#diagnostic";
import { Path } from "#path";
import type { StoreService } from "#store";
import { OptionBrand, OptionGroup } from "./enums.js";
import { type OptionDefinition, OptionDefinitionsMap, type OptionValue } from "./OptionDefinitionsMap.js";
import { OptionDiagnosticText } from "./OptionDiagnosticText.js";
import { OptionUsageText } from "./OptionUsageText.js";
import { OptionValidator } from "./OptionValidator.js";

export type { CommandLineOptions } from "../../models/CommandLineOptions.js";

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

  async #onExpectsValue(optionDefinition: OptionDefinition) {
    const text = [
      this.#optionDiagnosticText.expectsValue(optionDefinition.name),
      ...(await this.#optionUsageText.get(optionDefinition.name, optionDefinition.brand)),
    ];

    this.#onDiagnostic(Diagnostic.error(text));
  }

  async parse(commandLineArgs: Array<string>): Promise<void> {
    let index = 0;
    let arg = commandLineArgs[index];

    while (arg != null) {
      index++;

      if (arg.startsWith("--")) {
        const optionName = arg.slice(2);
        const optionDefinition = this.#commandLineOptionDefinitions.get(optionName);

        if (optionDefinition) {
          index = await this.#parseOptionValue(commandLineArgs, index, optionDefinition);
        } else {
          this.#onDiagnostic(Diagnostic.error(this.#optionDiagnosticText.unknownOption(arg)));
        }
      } else if (arg.startsWith("-")) {
        this.#onDiagnostic(Diagnostic.error(this.#optionDiagnosticText.unknownOption(arg)));
      } else {
        this.#pathMatch.push(Path.normalizeSlashes(arg));
      }

      arg = commandLineArgs[index];
    }
  }

  async #parseOptionValue(commandLineArgs: Array<string>, index: number, optionDefinition: OptionDefinition) {
    let optionValue = this.#resolveOptionValue(commandLineArgs[index]);

    switch (optionDefinition.brand) {
      case OptionBrand.True:
        this.#commandLineOptions[optionDefinition.name] = true;
        break;

      case OptionBrand.Boolean:
        await this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);

        this.#commandLineOptions[optionDefinition.name] = optionValue !== "false";

        if (optionValue === "false" || optionValue === "true") {
          index++;
        }
        break;

      case OptionBrand.List:
        if (optionValue !== "") {
          const optionValues = optionValue
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value !== ""); // in case if a comma was at the end of a list, e.g. "--target 5.0,current,"

          for (const optionValue of optionValues) {
            await this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);
          }

          this.#commandLineOptions[optionDefinition.name] = optionValues;
          index++;
          break;
        }

        await this.#onExpectsValue(optionDefinition);
        break;

      case OptionBrand.String:
        if (optionValue !== "") {
          if (optionDefinition.name === "config") {
            optionValue = Path.resolve(optionValue);
          }

          await this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);

          this.#commandLineOptions[optionDefinition.name] = optionValue;

          index++;
          break;
        }

        await this.#onExpectsValue(optionDefinition);
        break;

      default:
        break;
    }

    return index;
  }

  #resolveOptionValue(target = "") {
    return target.startsWith("-") ? "" : target;
  }
}
