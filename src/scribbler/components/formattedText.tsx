import { Line } from "../Line.js";
import { Scribbler } from "../Scribbler.js";

export class JsonText implements JSX.ElementClass {
  constructor(readonly props: { input: Array<string> | Record<string, unknown> }) {}

  render(): JSX.Element {
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

export function formattedText(input: string | Array<string> | Record<string, unknown>): JSX.Element {
  if (typeof input === "string") {
    return <Line>{input}</Line>;
  }

  return <JsonText input={input} />;
}
