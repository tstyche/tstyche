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

  static isCallable(isExpression: boolean, targetText: string): string {
    return `${isExpression ? "Expression" : "Type"} is callable ${targetText}.`;
  }

  static isNotCallable(isExpression: boolean, targetText: string): string {
    return `${isExpression ? "Expression" : "Type"} is not callable ${targetText}.`;
  }

  static isConstructable(isExpression: boolean, targetText: string): string {
    return `${isExpression ? "Expression" : "Type"} is constructable ${targetText}.`;
  }

  static isNotConstructable(isExpression: boolean, targetText: string): string {
    return `${isExpression ? "Expression" : "Type"} is not constructable ${targetText}.`;
  }

  static acceptsProps(isExpression: boolean): string {
    return `${isExpression ? "Component" : "Component type"} accepts props of the given type.`;
  }

  static doesNotAcceptProps(isExpression: boolean): string {
    return `${isExpression ? "Component" : "Component type"} does not accept props of the given type.`;
  }

  static canBeApplied(targetText: string): string {
    return `The decorator function can be applied${targetText}.`;
  }

  static cannotBeApplied(targetText: string): string {
    return `The decorator function cannot be applied${targetText}.`;
  }

  static doesNotHaveProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' does not have property '${propertyNameText}'.`;
  }

  static hasProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' has property '${propertyNameText}'.`;
  }

  static didYouMeanToUse(suggestionText: string): string {
    return `Did you mean to use ${suggestionText}?`;
  }

  static matcherIsNotSupported(matcherNameText: string): string {
    return `The '.${matcherNameText}()' matcher is not supported.`;
  }

  static overloadGaveTheFollowingError(index: number, count: number, signatureText: string): string {
    return `Overload ${index} of ${count}, '${signatureText}', gave the following error.`;
  }

  static raisedTypeError(count = 1): string {
    return `The raised type error${count === 1 ? "" : "s"}:`;
  }

  static typeArgumentMustBe(argumentNameText: string, expectedText: string): string {
    return `A type argument for '${argumentNameText}' must be ${expectedText}.`;
  }

  static raisedError(isExpression: boolean, count: number, targetCount: number): string {
    let countText = "a";

    if (count > 1 || targetCount > 1) {
      countText = count > targetCount ? `${count}` : `only ${count}`;
    }

    return `${isExpression ? "Expression" : "Type"} raised ${countText} type error${count === 1 ? "" : "s"}.`;
  }

  static didNotRaiseError(isExpression: boolean): string {
    return `${isExpression ? "Expression" : "Type"} did not raise a type error.`;
  }

  static raisedMatchingError(isExpression: boolean): string {
    return `${isExpression ? "Expression" : "Type"} raised a matching type error.`;
  }

  static didNotRaiseMatchingError(isExpression: boolean): string {
    return `${isExpression ? "Expression" : "Type"} did not raise a matching type error.`;
  }

  static isAssignableTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is assignable to type '${targetTypeText}'.`;
  }

  static isNotAssignableTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not assignable to type '${targetTypeText}'.`;
  }

  static isAssignableWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is assignable with type '${targetTypeText}'.`;
  }

  static isNotAssignableWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`;
  }

  static isIdenticalTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is identical to type '${targetTypeText}'.`;
  }

  static isNotIdenticalTo(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not identical to type '${targetTypeText}'.`;
  }

  static isNotCompatibleWith(sourceTypeText: string, targetTypeText: string): string {
    return `Type '${sourceTypeText}' is not compatible with type '${targetTypeText}'.`;
  }

  static requiresProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' requires property '${propertyNameText}'.`;
  }

  static typesOfPropertyAreNotCompatible(propertyNameText: string): string {
    return `Types of property '${propertyNameText}' are not compatible.`;
  }
}
