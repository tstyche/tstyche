import { capitalize } from "./helpers.js";

export class RejectDiagnosticText {
  static argumentCannotBeOfType(typeText: string): string {
    return `The argument cannot be of the '${typeText}' type.`;
  }

  static typeArgumentCannotBeOfType(typeText: string): string {
    return `The type argument cannot be of the '${typeText}' type.`;
  }

  static typeWasRejected(typeText: string): Array<string> {
    const optionNameText = `reject${capitalize(typeText)}Type`;

    return [
      `The '${typeText}' type was rejected because the '${optionNameText}' option is enabled.`,
      `If this check is necessary, pass '${typeText}' as the type argument explicitly.`,
    ];
  }
}
