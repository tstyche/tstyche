import { Line, type ScribblerJsx } from "#scribbler";

interface JsonTextProps {
  input: Array<string> | Record<string, unknown>;
}

export class JsonText implements ScribblerJsx.ElementClass {
  props: JsonTextProps;

  constructor(props: JsonTextProps) {
    this.props = props;
  }

  render(): ScribblerJsx.Element {
    return <Line>{JSON.stringify(this.#sortObject(this.props.input), null, 2)}</Line>;
  }

  #sortObject(target: Array<string> | Record<string, unknown>) {
    if (Array.isArray(target)) {
      return target;
    }

    return Object.keys(target)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = target[key];

        return result;
      }, {});
  }
}

export function formattedText(input: string | Array<string> | Record<string, unknown>): ScribblerJsx.Element {
  if (typeof input === "string") {
    return <Line>{input}</Line>;
  }

  return <JsonText input={input} />;
}
