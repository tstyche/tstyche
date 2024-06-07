import { OptionBrand, type OptionDefinition } from "#config";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

const usageExamples: Array<[commandText: string, descriptionText: string]> = [
  ["tstyche", "Run all tests."],
  ["tstyche path/to/first.test.ts", "Only run the test files with matching path."],
  ["tstyche --target 4.9,5.3.2,current", "Test on all specified versions of TypeScript."],
];

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
      The TSTyche Type Test Runner
      <HintText>{tstycheVersion}</HintText>
    </Line>
  );
}

interface CommandTextProps {
  hint?: ScribblerJsx.Element | undefined;
  text: string | ScribblerJsx.Element;
}

function CommandText({ hint, text }: CommandTextProps) {
  let hintText: ScribblerJsx.Element | undefined;

  if (hint != null) {
    hintText = <HintText>{hint}</HintText>;
  }

  return (
    <Line indent={1}>
      <Text color={Color.Blue}>{text}</Text>
      {hintText}
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
  const usageText = usageExamples.map(([commandText, descriptionText]) => (
    <Text>
      <CommandText text={commandText} />
      <OptionDescriptionText text={descriptionText} />
      <Line />
    </Text>
  ));

  return <Text>{usageText}</Text>;
}

interface CommandLineOptionNameTextProps {
  text: string;
}

function CommandLineOptionNameText({ text }: CommandLineOptionNameTextProps) {
  return <Text>--{text}</Text>;
}

interface CommandLineOptionHintTextProps {
  definition: OptionDefinition;
}

function CommandLineOptionHintText({ definition }: CommandLineOptionHintTextProps) {
  if (definition.brand === OptionBrand.List) {
    return (
      <Text>
        {definition.brand} of {definition.items.brand}s
      </Text>
    );
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

    if (definition.brand !== OptionBrand.BareTrue) {
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
      <Line>Command Line Options</Line>
      <Line />
      {optionsText}
    </Text>
  );
}

function HelpFooterText() {
  return <Line>To learn more, visit https://tstyche.org</Line>;
}

export function helpText(
  optionDefinitions: Map<string, OptionDefinition>,
  tstycheVersion: string,
): ScribblerJsx.Element {
  return (
    <Text>
      <HelpHeaderText tstycheVersion={tstycheVersion} />
      <Line />
      <CommandLineUsageText />
      <Line />
      <CommandLineOptionsText optionDefinitions={optionDefinitions} />
      <Line />
      <HelpFooterText />
      <Line />
    </Text>
  );
}
