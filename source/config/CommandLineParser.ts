import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { Path } from "#path";
import { ConfigDiagnosticText } from "./ConfigDiagnosticText.js";
import { OptionBrand } from "./OptionBrand.enum.js";
import { OptionGroup } from "./OptionGroup.enum.js";
import { type OptionDefinition, Options } from "./Options.js";
import type { OptionValue } from "./types.js";

export class CommandLineParser {
  #commandLineOptions: Record<string, OptionValue>;
  #onDiagnostics: DiagnosticsHandler;
  #options: Map<string, OptionDefinition>;
  #pathMatch: Array<string>;

  constructor(commandLine: Record<string, OptionValue>, pathMatch: Array<string>, onDiagnostics: DiagnosticsHandler) {
    this.#commandLineOptions = commandLine;
    this.#pathMatch = pathMatch;
    this.#onDiagnostics = onDiagnostics;

    this.#options = Options.for(OptionGroup.CommandLine);
  }

  #onExpectsValue(optionName: string, optionBrand: OptionBrand) {
    const text = [
      ConfigDiagnosticText.expectsValue(optionName),
      ...ConfigDiagnosticText.usage(optionName, optionBrand),
    ];

    this.#onDiagnostics(Diagnostic.error(text));
  }

  async parse(commandLineArgs: Array<string>): Promise<void> {
    let index = 0;
    let arg = commandLineArgs[index];

    while (arg != null) {
      index++;

      if (arg.startsWith("--")) {
        const optionDefinition = this.#options.get(arg.slice(2));

        if (optionDefinition) {
          index = await this.#parseOptionValue(commandLineArgs, index, arg, optionDefinition);
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

  async #parseOptionValue(
    commandLineArgs: Array<string>,
    index: number,
    optionName: string,
    optionDefinition: OptionDefinition,
  ) {
    let optionValue = this.#resolveOptionValue(commandLineArgs[index]);

    switch (optionDefinition.brand) {
      case OptionBrand.BareTrue:
        await Options.validate(optionName, optionValue, optionDefinition.brand, this.#onDiagnostics);

        this.#commandLineOptions[optionDefinition.name] = true;
        break;

      case OptionBrand.Boolean:
        await Options.validate(optionName, optionValue, optionDefinition.brand, this.#onDiagnostics);

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
            .filter((value) => value !== "") // trailing commas are allowed, e.g. "--target 5.0,5.3.2,"
            .map((value) => Options.resolve(optionName, value));

          for (const optionValue of optionValues) {
            await Options.validate(optionName, optionValue, optionDefinition.brand, this.#onDiagnostics);
          }

          this.#commandLineOptions[optionDefinition.name] = optionValues;
          index++;
          break;
        }

        this.#onExpectsValue(optionName, optionDefinition.brand);
        break;

      case OptionBrand.String:
        if (optionValue !== "") {
          optionValue = Options.resolve(optionName, optionValue);

          await Options.validate(optionName, optionValue, optionDefinition.brand, this.#onDiagnostics);

          this.#commandLineOptions[optionDefinition.name] = optionValue;

          index++;
          break;
        }

        this.#onExpectsValue(optionName, optionDefinition.brand);
        break;
    }

    return index;
  }

  #resolveOptionValue(target = "") {
    return target.startsWith("-") ? "" : target;
  }
}
