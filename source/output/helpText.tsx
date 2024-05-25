import { OptionBrand, type OptionDefinition } from "#config";
import { Color, Line, type ScribblerJsx, Text } from "#scribbler";

const usageExamples: Array<[commandText: string, descriptionText: string]> = [
  ["tstyche", "Run all tests."],
  ["tstyche path/to/first.test.ts", "Only run the test files with matching path."],
  ["tstyche --target 4.9,5.3.2,current", "Test on all specified versions of TypeScript."],
];

class HintText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { children: ScribblerJsx.Element }) {}

  render(): ScribblerJsx.Element {
    return (
      <Text indent={1} color={Color.Gray}>
        {this.props.children}
      </Text>
    );
  }
}

class HelpHeaderText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { tstycheVersion: string }) {}

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

class CommandText implements ScribblerJsx.ElementClass {
  constructor(
    readonly props: {
      hint?: ScribblerJsx.Element | undefined;
      text: string | ScribblerJsx.Element;
    },
  ) {}

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

class OptionDescriptionText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { text: string }) {}

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

class CommandLineOptionNameText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { text: string }) {}

  render(): ScribblerJsx.Element {
    return <Text>--{this.props.text}</Text>;
  }
}

class CommandLineOptionHintText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { definition: OptionDefinition }) {}

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

class CommandLineOptionsText implements ScribblerJsx.ElementClass {
  constructor(readonly props: { optionDefinitions: Map<string, OptionDefinition> }) {}

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
