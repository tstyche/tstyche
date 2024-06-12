import { Line, type ScribblerJsx } from "#scribbler";

export function formattedText(input: string | Array<string> | Record<string, unknown>): ScribblerJsx.Element {
  if (typeof input === "string") {
    return <Line>{input}</Line>;
  }

  if (Array.isArray(input)) {
    return <Line>{JSON.stringify(input, null, 2)}</Line>;
  }

  function sortObject(target: Record<string, unknown>) {
    return Object.keys(target)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = target[key];

        return result;
      }, {});
  }

  return <Line>{JSON.stringify(sortObject(input), null, 2)}</Line>;
}
