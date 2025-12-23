import { OptionBrand, type OptionDefinition } from "#config";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

interface HintTextProps {
  children: ScribblerJsx.Element | string;
}

function HintText({ children }: HintTextProps) {
  return (
    <Text indent={1} color={Color.Gray}>
      {children}
    </Text>
  );
}

interface HelpHeaderTextProps {
  tstycheVersion: string;
}

function HelpHeaderText({ tstycheVersion }: HelpHeaderTextProps) {
  return (
    <Line>
      {"The TSTyche Type Test Runner"}
      <HintText>{tstycheVersion}</HintText>
    </Line>
  );
}

interface CommandTextProps {
  hint?: ScribblerJsx.Element | undefined;
  text: string | ScribblerJsx.Element;
}

function CommandText({ hint, text }: CommandTextProps) {
  return (
    <Line indent={1}>
      <Text color={Color.Blue}>{text}</Text>
      {hint && <HintText>{hint}</HintText>}
    </Line>
  );
}

interface OptionDescriptionTextProps {
  text: string;
}

function OptionDescriptionText({ text }: OptionDescriptionTextProps) {
  return <Line indent={1}>{text}</Line>;
}

function CommandLineUsageText() {
  const usage: Array<[commandText: string, descriptionText: string]> = [
    ["tstyche", "Run all tests."],
    ["tstyche query-params", "Only run the matching test file."],
    ["tstyche --target '5.4 || 5.6.2 || >=5.8'", "Test against specific versions of TypeScript."],
  ];

  const usageText = usage.map(([commandText, descriptionText]) => (
    <Line>
      <CommandText text={commandText} />
      <OptionDescriptionText text={descriptionText} />
    </Line>
  ));

  return <Text>{usageText}</Text>;
}

interface CommandLineOptionNameTextProps {
  text: string;
}

function CommandLineOptionNameText({ text }: CommandLineOptionNameTextProps) {
  return <Text>{`--${text}`}</Text>;
}

interface CommandLineOptionHintTextProps {
  definition: OptionDefinition;
}

function CommandLineOptionHintText({ definition }: CommandLineOptionHintTextProps) {
  if (definition.brand === OptionBrand.List) {
    return <Text>{`${definition.brand} of ${definition.items.brand}s`}</Text>;
  }

  if (definition.brand === OptionBrand.SemverRange) {
    return <Text>{"string"}</Text>;
  }

  return <Text>{definition.brand}</Text>;
}

interface CommandLineOptionsTextProps {
  optionDefinitions: Map<string, OptionDefinition>;
}

function CommandLineOptionsText({ optionDefinitions }: CommandLineOptionsTextProps) {
  const definitions = [...optionDefinitions.values()];
  const optionsText = definitions.map((definition) => {
    let hint: ScribblerJsx.Element | undefined;

    if (definition.brand !== OptionBrand.True) {
      hint = <CommandLineOptionHintText definition={definition} />;
    }

    return (
      <Text>
        <CommandText text={<CommandLineOptionNameText text={definition.name} />} hint={hint} />
        <OptionDescriptionText text={definition.description} />
        <Line />
      </Text>
    );
  });

  return (
    <Text>
      <Line>{"Command Line Options"}</Line>
      <Line />
      {optionsText}
    </Text>
  );
}

function HelpFooterText() {
  return <Line>{"To learn more, visit https://tstyche.org"}</Line>;
}

export function helpText(options: Map<string, OptionDefinition>, version: string): ScribblerJsx.Element {
  return (
    <Text>
      <HelpHeaderText tstycheVersion={version} />
      <Line />
      <CommandLineUsageText />
      <Line />
      <CommandLineOptionsText optionDefinitions={options} />
      <Line />
      <HelpFooterText />
      <Line />
    </Text>
  );
}
