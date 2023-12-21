import { OptionBrand, type OptionDefinition } from "#config";
import { Color } from "../Color.js";
import { Scribbler } from "../Scribbler.js";
import { Line } from "./Line.js";
import { Text } from "./Text.js";

const usageExamples: Array<[commandText: string, descriptionText: string]> = [
  ["tstyche", "Run all tests."],
  ["tstyche path/to/first.test.ts second", "Only run the test files with matching path."],
  ["tstyche --target 4.7,4.8,latest", "Test on all specified versions of TypeScript."],
];

class HintText implements JSX.ElementClass {
  constructor(readonly props: { children: JSX.Element }) {}

  render(): JSX.Element {
    return (
      <Text indent={1} color={Color.Gray}>
        {this.props.children}
      </Text>
    );
  }
}

class HelpHeaderText implements JSX.ElementClass {
  constructor(readonly props: { tstycheVersion: string }) {}

  render(): JSX.Element {
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

class CommandText implements JSX.ElementClass {
  constructor(
    readonly props: {
      hint?: JSX.Element;
      text: string | JSX.Element;
    },
  ) {}

  render(): JSX.Element {
    let hint: JSX.Element | undefined = undefined;

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

class OptionDescriptionText implements JSX.ElementClass {
  constructor(readonly props: { text: string }) {}

  render(): JSX.Element {
    return <Line indent={1}>{this.props.text}</Line>;
  }
}

class CliUsageText implements JSX.ElementClass {
  render(): JSX.Element {
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

class OptionNameText implements JSX.ElementClass {
  constructor(readonly props: { text: string }) {}

  render(): JSX.Element {
    return <Text>--{this.props.text}</Text>;
  }
}

class OptionHintText implements JSX.ElementClass {
  constructor(readonly props: { definition: OptionDefinition }) {}

  render(): JSX.Element {
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

class CliOptionsText implements JSX.ElementClass {
  constructor(readonly props: { optionDefinitions: Map<string, OptionDefinition> }) {}

  render(): JSX.Element {
    const definitions = Array.from(this.props.optionDefinitions.values());
    const optionsText = definitions.map((definition) => (
      <Text>
        <CommandText
          text={<OptionNameText text={definition.name} />}
          hint={<OptionHintText definition={definition} />}
        />
        <OptionDescriptionText text={definition.description} />
        <Line />
      </Text>
    ));

    return (
      <Text>
        <Line>CLI Options</Line>
        <Line />
        {optionsText}
      </Text>
    );
  }
}

class HelpFooterText implements JSX.ElementClass {
  render(): JSX.Element {
    return <Line>To learn more, visit https://tstyche.org</Line>;
  }
}

export function helpText(optionDefinitions: Map<string, OptionDefinition>, tstycheVersion: string): JSX.Element {
  return (
    <Text>
      <HelpHeaderText tstycheVersion={tstycheVersion} />
      <Line />
      <CliUsageText />
      <Line />
      <CliOptionsText optionDefinitions={optionDefinitions} />
      <Line />
      <HelpFooterText />
      <Line />
    </Text>
  );
}
