export class ExpectDiagnosticText {
  static argumentOrTypeArgumentMustBeProvided(argumentNameText: string, typeArgumentNameText: string): string {
    return `An argument for '${argumentNameText}' or type argument for '${typeArgumentNameText}' must be provided.`;
  }

  static argumentMustBeOf(argumentNameText: string, expectedText: string, receivedTypeText: string): Array<string> {
    return [
      `An argument for '${argumentNameText}' must be of ${expectedText}.`,
      `Received type '${receivedTypeText}'.`,
    ];
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

  static overloadGaveTheFollowingError(indexText: string, countText: string, signatureText: string): string {
    return `Overload ${indexText} of ${countText}, '${signatureText}', gave the following error.`;
  }

  static typeArgumentMustBeOf(argumentNameText: string, expectedText: string, receivedTypeText: string): Array<string> {
    return [
      `A type argument for '${argumentNameText}' must be of ${expectedText}.`,
      `Received type '${receivedTypeText}'.`,
    ];
  }

  static typeDoesNotHaveProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' does not have property '${propertyNameText}'.`;
  }

  static typeHasProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' has property '${propertyNameText}'.`;
  }

  static typeRequiresProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' requires property '${propertyNameText}'.`;
  }

  static typeDoesMatch(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' does match type '${targetTypeText}'.`;
  }

  static typeDoesNotMatch(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' does not match type '${targetTypeText}'.`;
  }

  static typeIs(typeText: string): string {
    return `Type is '${typeText}'.`;
  }

  static typeIsAssignableTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is assignable to type '${targetTypeText}'.`;
  }

  static typeIsNotAssignableTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not assignable to type '${targetTypeText}'.`;
  }

  static typeIsAssignableWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is assignable with type '${targetTypeText}'.`;
  }

  static typeIsIdenticalTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is identical to type '${targetTypeText}'.`;
  }

  static typeIsNotIdenticalTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not identical to type '${targetTypeText}'.`;
  }

  static typeIsNotAssignableWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`;
  }

  static typeIsNotCompatibleWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not compatible with type '${targetTypeText}'.`;
  }

  static typesOfPropertyAreNotCompatible(propertyNameText: string): string {
    return `Types of property '${propertyNameText}' are not compatible.`;
  }
}
