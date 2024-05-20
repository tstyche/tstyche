import fs from "node:fs/promises";
import process from "node:process";
import * as tstyche from "tstyche/tstyche";
import ts from "typescript";

const commandLineOptionDefinitions = tstyche.OptionDefinitionsMap.for(tstyche.OptionGroup.CommandLine);
const configFileOptionDefinitions = tstyche.OptionDefinitionsMap.for(tstyche.OptionGroup.ConfigFile);

/** @type {Array<[string, string, Map<string, tstyche.OptionDefinition>]>} */
const filesToGenerate = [
  ["ConfigFileOptions", "Options loaded from the configuration file.", configFileOptionDefinitions],
  ["CommandLineOptions", "Options passed through the command line.", commandLineOptionDefinitions],
];

/**
 * @param {string} commentText
 */
function formatCommentText(commentText) {
  return ["*", ` * ${commentText}`, " "].join("\n");
}

/**
 * @param {string} identifierText
 * @param {tstyche.ItemDefinition} itemDefinition
 * @param {string} commentText
 */
function createArrayPropertySignature(identifierText, itemDefinition, commentText) {
  /** @type {Array<ts.TypeNode>} */
  const typeArguments = [];

  switch (itemDefinition.brand) {
    case tstyche.OptionBrand.String: {
      typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
      break;
    }

    default: {
      typeArguments.push(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword));
      break;
    }
  }

  const propertySignature = ts.factory.createPropertySignature(
    undefined,
    ts.factory.createIdentifier(identifierText),
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Array"), typeArguments),
  );

  ts.addSyntheticLeadingComment(
    propertySignature,
    ts.SyntaxKind.MultiLineCommentTrivia,
    formatCommentText(commentText),
    /* hasTrailingNewLine */ true,
  );

  return propertySignature;
}

/**
 * @param {string} identifierText
 * @param {ts.KeywordTypeSyntaxKind} syntaxKind
 * @param {string} commentText
 */
function createPrimitivePropertySignature(identifierText, syntaxKind, commentText) {
  const typeNode = ts.factory.createKeywordTypeNode(syntaxKind);

  const propertySignature = ts.factory.createPropertySignature(
    /* modifiers */ undefined,
    ts.factory.createIdentifier(identifierText),
    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    typeNode,
  );

  ts.addSyntheticLeadingComment(
    propertySignature,
    ts.SyntaxKind.MultiLineCommentTrivia,
    formatCommentText(commentText),
    /* hasTrailingNewLine */ true,
  );

  return propertySignature;
}

/**
 * @param {string} identifierText
 * @param {string} commentText
 * @param {Map<string, tstyche.OptionDefinition>} optionDefinitions
 */
function createInterfaceDeclaration(identifierText, commentText, optionDefinitions) {
  /** @type {Array<ts.PropertySignature>} */
  const members = [];

  for (const [key, optionDefinition] of optionDefinitions) {
    switch (optionDefinition.brand) {
      case tstyche.OptionBrand.Boolean:
      case tstyche.OptionBrand.True: {
        members.push(createPrimitivePropertySignature(key, ts.SyntaxKind.BooleanKeyword, optionDefinition.description));
        break;
      }

      case tstyche.OptionBrand.List: {
        members.push(createArrayPropertySignature(key, optionDefinition.items, optionDefinition.description));
        break;
      }

      case tstyche.OptionBrand.Number: {
        members.push(createPrimitivePropertySignature(key, ts.SyntaxKind.NumberKeyword, optionDefinition.description));
        break;
      }

      case tstyche.OptionBrand.String: {
        members.push(createPrimitivePropertySignature(key, ts.SyntaxKind.StringKeyword, optionDefinition.description));
        break;
      }

      default:
        break;
    }
  }

  const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(identifierText),
    /* typeParameters */ undefined,
    /* heritageClauses */ undefined,
    members,
  );

  ts.addSyntheticLeadingComment(
    interfaceDeclaration,
    ts.SyntaxKind.MultiLineCommentTrivia,
    formatCommentText(commentText),
    /* hasTrailingNewLine */ true,
  );

  return interfaceDeclaration;
}

const resultFile = ts.createSourceFile(
  "virtual.ts",
  "",
  ts.ScriptTarget.Latest,
  /* setParentNodes */ false,
  ts.ScriptKind.TS,
);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

for (const [identifierText, description, optionDefinitions] of filesToGenerate) {
  const declarationFileText = printer.printNode(
    ts.EmitHint.Unspecified,
    createInterfaceDeclaration(identifierText, description, optionDefinitions),
    resultFile,
  );

  const declarationFileUrl = new URL(`../${identifierText}.ts`, import.meta.url);

  await fs.writeFile(
    declarationFileUrl,
    ["// This is a generated file. See: ./__scripts__/generate-types.js\n", `${declarationFileText}\n`].join("\n"),
  );

  process.stdout.write(`Declaration was written to: '${declarationFileUrl.toString()}'\n`);
}
