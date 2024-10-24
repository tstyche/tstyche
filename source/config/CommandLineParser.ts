import { pathToFileURL } from "node:url";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { Path } from "#path";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import { OptionBrand } from "./OptionBrand.enum.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { OptionUsageText } from "./OptionUsageText.js";
import { OptionValidator } from "./OptionValidator.js";
import { type OptionDefinition, Options } from "./Options.js";
import type { OptionValue } from "./types.js";

export class CommandLineParser {
  #commandLineOptions: Record<string, OptionValue>;
  #onDiagnostics: DiagnosticsHandler;
  #options: Map<string, OptionDefinition>;
  #optionGroup = OptionGroup.CommandLine;
  #optionUsageText: OptionUsageText;
  #optionValidator: OptionValidator;
  #pathMatch: Array<string>;

  constructor(commandLine: Record<string, OptionValue>, pathMatch: Array<string>, onDiagnostics: DiagnosticsHandler) {
    this.#commandLineOptions = commandLine;
    this.#pathMatch = pathMatch;
    this.#onDiagnostics = onDiagnostics;

    this.#options = Options.for(this.#optionGroup);

    this.#optionUsageText = new OptionUsageText(this.#optionGroup);
    this.#optionValidator = new OptionValidator(this.#optionGroup, this.#onDiagnostics);
  }

  async #onExpectsValue(optionDefinition: OptionDefinition) {
    const text = [
      ConfigDiagnosticText.expectsValue(optionDefinition.name, this.#optionGroup),
      ...(await this.#optionUsageText.get(optionDefinition.name, optionDefinition.brand)),
    ];

    this.#onDiagnostics(Diagnostic.error(text));
  }

  async parse(commandLineArgs: Array<string>): Promise<void> {
    let index = 0;
    let arg = commandLineArgs[index];

    while (arg != null) {
      index++;

      if (arg.startsWith("--")) {
        const optionName = arg.slice(2);
        const optionDefinition = this.#options.get(optionName);

        if (optionDefinition) {
          index = await this.#parseOptionValue(commandLineArgs, index, optionDefinition);
        } else {
          this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.unknownOption(arg)));
        }
      } else if (arg.startsWith("-")) {
        this.#onDiagnostics(Diagnostic.error(ConfigDiagnosticText.unknownOption(arg)));
      } else {
        this.#pathMatch.push(Path.normalizeSlashes(arg));
      }

      arg = commandLineArgs[index];
    }
  }

  async #parseOptionValue(commandLineArgs: Array<string>, index: number, optionDefinition: OptionDefinition) {
    let optionValue = this.#resolveOptionValue(commandLineArgs[index]);

    switch (optionDefinition.brand) {
      case OptionBrand.BareTrue:
        await this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);

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
          let optionValues = optionValue
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value !== ""); // trailing commas are allowed, e.g. "--target 5.0,current,"

          if (optionDefinition.name === "plugins" || optionDefinition.name === "reporters") {
            optionValues = optionValues.map((optionValue) => {
              if (optionValue.startsWith(".")) {
                return pathToFileURL(optionValue).toString();
              }

              return optionValue;
            });
          }

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
          if (
            optionDefinition.name === "config" ||
            (optionDefinition.name === "tsconfig" && !["findup", "ignore"].includes(optionValue))
          ) {
            optionValue = Path.resolve(optionValue);
          }

          await this.#optionValidator.check(optionDefinition.name, optionValue, optionDefinition.brand);

          this.#commandLineOptions[optionDefinition.name] = optionValue;

          index++;
          break;
        }

        await this.#onExpectsValue(optionDefinition);
        break;
    }

    return index;
  }

  #resolveOptionValue(target = "") {
    return target.startsWith("-") ? "" : target;
  }
}
