import { OptionBrand, type OptionDefinition } from "#config";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

const usageExamples: Array<[commandText: string, descriptionText: string]> = [
  ["tstyche", "Run all tests."],
  ["tstyche path/to/first.test.ts", "Only run the test files with matching path."],
  ["tstyche --target 4.9,5.3.2,current", "Test on all specified versions of TypeScript."],
];

interface HintTextProps {
  children: ScribblerJsx.Element;
}

class HintText implements ScribblerJsx.ElementClass {
  props: HintTextProps;

  constructor(props: HintTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    return (
      <Text indent={1} color={Color.Gray}>
        {this.props.children}
      </Text>
    );
  }
}

interface HelpHeaderTextProps {
  tstycheVersion: string;
}

class HelpHeaderText implements ScribblerJsx.ElementClass {
  props: HelpHeaderTextProps;

  constructor(props: HelpHeaderTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    const hint = (
      <HintText>
        <Text>{this.props.tstycheVersion}</Text>
      </HintText>
    );

    return (
      <Line>
        <Text>The TSTyche Type Test Runner</Text>
        {hint}
      </Line>
    );
  }
}

interface CommandTextProps {
  hint?: ScribblerJsx.Element | undefined;
  text: string | ScribblerJsx.Element;
}

class CommandText implements ScribblerJsx.ElementClass {
  props: CommandTextProps;

  constructor(props: CommandTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    let hint: ScribblerJsx.Element | undefined;

    if (this.props.hint != null) {
      hint = <HintText>{this.props.hint}</HintText>;
    }

    return (
      <Line indent={1}>
        <Text color={Color.Blue}>{this.props.text}</Text>
        {hint}
      </Line>
    );
  }
}

interface OptionDescriptionTextProps {
  text: string;
}

class OptionDescriptionText implements ScribblerJsx.ElementClass {
  props: OptionDescriptionTextProps;

  constructor(props: OptionDescriptionTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    return <Line indent={1}>{this.props.text}</Line>;
  }
}

class CommandLineUsageText implements ScribblerJsx.ElementClass {
  render(): ScribblerJsx.Element {
    const usageText = usageExamples.map(([commandText, descriptionText]) => (
      <Text>
        <CommandText text={commandText} />
        <OptionDescriptionText text={descriptionText} />
        <Line />
      </Text>
    ));

    return <Text>{usageText}</Text>;
  }
}

interface CommandLineOptionNameTextProps {
  text: string;
}

class CommandLineOptionNameText implements ScribblerJsx.ElementClass {
  props: CommandLineOptionNameTextProps;

  constructor(props: CommandLineOptionNameTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    return <Text>--{this.props.text}</Text>;
  }
}

interface CommandLineOptionHintTextProps {
  definition: OptionDefinition;
}

class CommandLineOptionHintText implements ScribblerJsx.ElementClass {
  props: CommandLineOptionHintTextProps;

  constructor(props: CommandLineOptionHintTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    if (this.props.definition.brand === OptionBrand.List) {
      return (
        <Text>
          {this.props.definition.brand} of {this.props.definition.items.brand}s
        </Text>
      );
    }

    return <Text>{this.props.definition.brand}</Text>;
  }
}

interface CommandLineOptionsTextProps {
  optionDefinitions: Map<string, OptionDefinition>;
}

class CommandLineOptionsText implements ScribblerJsx.ElementClass {
  props: CommandLineOptionsTextProps;

  constructor(props: CommandLineOptionsTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    const definitions = [...this.props.optionDefinitions.values()];
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
}

class HelpFooterText implements ScribblerJsx.ElementClass {
  render(): ScribblerJsx.Element {
    return <Line>To learn more, visit https://tstyche.org</Line>;
  }
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
