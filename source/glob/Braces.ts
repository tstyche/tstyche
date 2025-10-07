export class Braces {
  static expand(text: string): Array<string> {
    const start = text.indexOf("{");

    if (start === -1) {
      return [text];
    }

    // find closing pair of braces
    let position = start;
    let depth = 0;

    for (position; position < text.length; position++) {
      if (text[position] === "{") {
        depth++;
      } else if (text[position] === "}") {
        depth--;
      }

      if (depth === 0) {
        break;
      }
    }

    // unbalanced braces
    if (depth !== 0) {
      return [text];
    }

    const before = text.slice(0, start);
    const options = Braces.#splitOptions(text.slice(start + 1, position));
    const after = text.slice(position + 1);

    const result: Array<string> = [];

    for (const option of options) {
      for (const expanded of Braces.expand(option + after)) {
        result.push(before + expanded);
      }
    }

    return result;
  }

  static #splitOptions(optionText: string) {
    const options: Array<string> = [];

    let current = "";
    let depth = 0;

    for (const character of optionText) {
      if (character === "," && depth === 0) {
        options.push(current);
        current = "";
      } else {
        if (character === "{") {
          depth++;
        }

        if (character === "}") {
          depth--;
        }

        current += character;
      }
    }

    options.push(current);

    return options;
  }
}
