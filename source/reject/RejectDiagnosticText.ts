import { capitalize } from "./helpers.js";

export class RejectDiagnosticText {
  static argumentCannotBeOfType(argumentNameText: string, typeText: string): string {
    return `An argument for '${argumentNameText}' cannot be of the '${typeText}' type.`;
  }

  static argumentMustBeProvided(argumentNameText: string): string {
    return `An argument for '${argumentNameText}' must be provided.`;
  }

  static typeArgumentCannotBeOfType(argumentNameText: string, typeText: string): string {
    return `A type argument for '${argumentNameText}' cannot be of the '${typeText}' type.`;
  }

  static typeWasRejected(typeText: string): Array<string> {
    const optionNameText = `reject${capitalize(typeText)}Type`;

    return [
      `The '${typeText}' type was rejected because the '${optionNameText}' option is enabled.`,
      `If this check is necessary, pass '${typeText}' as the type argument explicitly.`,
    ];
  }
}
