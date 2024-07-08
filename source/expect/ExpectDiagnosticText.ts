export class ExpectDiagnosticText {
  static argumentOrTypeArgumentMustBeProvided(argumentNameText: string, typeArgumentNameText: string): string {
    return `An argument for '${argumentNameText}' or type argument for '${typeArgumentNameText}' must be provided.`;
  }

  static argumentMustBeOf(argumentNameText: string, expectedText: string, receivedTypeText: string): string {
    return `An argument for '${argumentNameText}' must be of ${expectedText}, received: '${receivedTypeText}'.`;
  }

  static argumentMustBeProvided(argumentNameText: string): string {
    return `An argument for '${argumentNameText}' must be provided.`;
  }

  static matcherIsDeprecated(matcherNameText: string): Array<string> {
    return [
      `The '.${matcherNameText}()' matcher is deprecated and will be removed in TSTyche 3.`,
      "To learn more, visit https://tstyche.org/releases/tstyche-2",
    ];
  }

  static matcherIsNotSupported(matcherNameText: string): string {
    return `The '.${matcherNameText}()' matcher is not supported.`;
  }

  static typeArgumentMustBeOf(argumentNameText: string, expectedText: string, receivedTypeText: string): string {
    return `A type argument for '${argumentNameText}' must be of ${expectedText}, received: '${receivedTypeText}'.`;
  }

  static typeDoesNotHaveProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' does not have property '${propertyNameText}'.`;
  }

  static typeHasProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' has property '${propertyNameText}'.`;
  }

  static typeIs(typeText: string): string {
    return `The type is '${typeText}'.`;
  }
}
