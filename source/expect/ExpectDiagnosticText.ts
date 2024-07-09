export class ExpectDiagnosticText {
  static argumentOrTypeArgumentMustBeProvided(argumentNameText: string, typeArgumentNameText: string): string {
    return `An argument for '${argumentNameText}' or type argument for '${typeArgumentNameText}' must be provided.`;
  }

  static argumentMustBe(argumentNameText: string, expectedText: string): string {
    return `An argument for '${argumentNameText}' must be ${expectedText}.`;
  }

  static argumentMustBeProvided(argumentNameText: string): string {
    return `An argument for '${argumentNameText}' must be provided.`;
  }

  static componentAcceptsProps(isTypeNode: boolean): string {
    return `${isTypeNode ? "Component type" : "Component"} accepts props of the given type.`;
  }

  static componentDoesNotAcceptProps(isTypeNode: boolean): string {
    return `${isTypeNode ? "Component type" : "Component"} does not accept props of the given type.`;
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

  static raisedTypeError(count = 1): string {
    return `The raised type error${count === 1 ? "" : "s"}:`;
  }

  static typeArgumentMustBe(argumentNameText: string, expectedText: string): string {
    return `A type argument for '${argumentNameText}' must be ${expectedText}.`;
  }

  static typeDidNotRaiseError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} did not raise a type error.`;
  }

  static typeDidNotRaiseMatchingError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} did not raise a matching type error.`;
  }

  static typeDoesNotHaveProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' does not have property '${propertyNameText}'.`;
  }

  static typeDoesMatch(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' does match type '${targetTypeText}'.`;
  }

  static typeDoesNotMatch(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' does not match type '${targetTypeText}'.`;
  }

  static typeHasProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' has property '${propertyNameText}'.`;
  }

  static typeIs(typeText: string): string {
    return `Type is '${typeText}'.`;
  }

  static typeIsAssignableTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is assignable to type '${targetTypeText}'.`;
  }

  static typeIsAssignableWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is assignable with type '${targetTypeText}'.`;
  }

  static typeIsIdenticalTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is identical to type '${targetTypeText}'.`;
  }

  static typeIsNotAssignableTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not assignable to type '${targetTypeText}'.`;
  }

  static typeIsNotAssignableWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`;
  }

  static typeIsNotCompatibleWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not compatible with type '${targetTypeText}'.`;
  }

  static typeIsNotIdenticalTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not identical to type '${targetTypeText}'.`;
  }

  static typeRaisedError(isTypeNode: boolean, count: number, targetCount: number): string {
    let countText = "a";

    if (count > 1 || targetCount > 1) {
      countText = count > targetCount ? String(count) : `only ${String(count)}`;
    }

    return `${isTypeNode ? "Type" : "Expression type"} raised ${countText} type error${count === 1 ? "" : "s"}.`;
  }

  static typeRaisedMatchingError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} raised a matching type error.`;
  }

  static typeRequiresProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' requires property '${propertyNameText}'.`;
  }

  static typesOfPropertyAreNotCompatible(propertyNameText: string): string {
    return `Types of property '${propertyNameText}' are not compatible.`;
  }
}
