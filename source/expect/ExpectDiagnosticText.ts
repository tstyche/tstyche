import { Format } from "./Format.js";

export class ExpectDiagnosticText {
  static argumentCannotBeOfType(argumentNameText: string, typeText: string): string {
    return `An argument for '${argumentNameText}' cannot be of the '${typeText}' type.`;
  }

  static argumentOrTypeArgumentMustBeProvided(argumentNameText: string, typeArgumentNameText: string): string {
    return `An argument for '${argumentNameText}' or type argument for '${typeArgumentNameText}' must be provided.`;
  }

  static argumentMustBe(argumentNameText: string, expectedText: string): string {
    return `An argument for '${argumentNameText}' must be ${expectedText}.`;
  }

  static argumentMustBeProvided(argumentNameText: string): string {
    return `An argument for '${argumentNameText}' must be provided.`;
  }

  static acceptsProps(isTypeNode: boolean): string {
    return `${isTypeNode ? "Component type" : "Component"} accepts props of the given type.`;
  }

  static doesNotAcceptProps(isTypeNode: boolean): string {
    return `${isTypeNode ? "Component type" : "Component"} does not accept props of the given type.`;
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

  static matcherIsNotSupported(matcherNameText: string): string {
    return `The '.${matcherNameText}()' matcher is not supported.`;
  }

  static overloadGaveTheFollowingError(index: number, count: number, signatureText: string): string {
    return `Overload ${index} of ${count}, '${signatureText}', gave the following error.`;
  }

  static raisedTypeError(count = 1): string {
    return `The raised type error${count === 1 ? "" : "s"}:`;
  }

  static typeArgumentCannotBeOfType(argumentNameText: string, typeText: string): string {
    return `A type argument for '${argumentNameText}' cannot be of the '${typeText}' type.`;
  }

  static typeArgumentMustBe(argumentNameText: string, expectedText: string): string {
    return `A type argument for '${argumentNameText}' must be ${expectedText}.`;
  }

  static raisedError(isTypeNode: boolean, count: number, targetCount: number): string {
    let countText = "a";

    if (count > 1 || targetCount > 1) {
      countText = count > targetCount ? `${count}` : `only ${count}`;
    }

    return `${isTypeNode ? "Type" : "Expression type"} raised ${countText} type error${count === 1 ? "" : "s"}.`;
  }

  static didNotRaiseError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} did not raise a type error.`;
  }

  static raisedMatchingError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} raised a matching type error.`;
  }

  static didNotRaiseMatchingError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} did not raise a matching type error.`;
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

  static typeWasRejected(typeText: string): Array<string> {
    const optionNameText = `reject${Format.capitalize(typeText)}Type`;

    return [
      `The '${typeText}' type was rejected because the '${optionNameText}' option is enabled.`,
      `If this check is necessary, pass '${typeText}' as the type argument explicitly.`,
    ];
  }
}
