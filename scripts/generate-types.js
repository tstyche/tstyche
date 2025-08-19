import fs from "node:fs/promises";
import CodeBlockWriter from "code-block-writer";
import * as tstyche from "tstyche/tstyche";

const commandLineOptions = tstyche.Options.for(tstyche.OptionGroup.CommandLine);
const configFileOptions = tstyche.Options.for(tstyche.OptionGroup.ConfigFile);

/** @type {Array<[string, Map<string, tstyche.OptionDefinition>]>} */
const interfacesToWrite = [
  ["CommandLineOptions", commandLineOptions],
  ["ConfigFileOptions", configFileOptions],
];

/**
 * @param {tstyche.OptionDefinition | tstyche.ItemDefinition} definition
 * @returns {string}
 */
function getTypeText(definition) {
  switch (definition.brand) {
    case tstyche.OptionBrand.Boolean:
    case tstyche.OptionBrand.True:
      return "boolean";

    case tstyche.OptionBrand.List:
      return `Array<${getTypeText(definition.items)}>`;

    case tstyche.OptionBrand.SemverRange:
      return "Array<string>";

    case tstyche.OptionBrand.Number:
      return "number";

    case tstyche.OptionBrand.String:
      return "string";

    default:
      return "unknown";
  }
}

const writer = new CodeBlockWriter({ indentNumberOfSpaces: 2 });

writer.writeLine("// #region -- Generated code, to update run: yarn build && yarn generate").blankLine();

for (const [identifier, optionDefinitions] of interfacesToWrite) {
  writer
    .write(`export interface ${identifier}`)
    .block(() => {
      for (const [key, definition] of optionDefinitions) {
        if (key.startsWith("$")) {
          continue;
        }

        writer.writeLine(`${key}?: ${getTypeText(definition)};`);
      }
    })
    .blankLine();
}

writer.writeLine("// #endregion");

const fileUrl = new URL("../source/config/types.ts", import.meta.url);
const fileText = await fs.readFile(fileUrl, { encoding: "utf8" });
const updatedFileText = fileText.replace(/\/\/ #region[\s\S]*?\/\/ #endregion\n/, writer.toString());

await fs.writeFile(fileUrl, updatedFileText);

console.info(`Type declarations were written to: '${fileUrl.toString()}'`);
