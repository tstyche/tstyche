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

  static componentAcceptsProps(isTypeNode: boolean): string {
    return `${isTypeNode ? "Component type" : "Component"} accepts props of the given type.`;
  }

  static componentDoesNotAcceptProps(isTypeNode: boolean): string {
    return `${isTypeNode ? "Component type" : "Component"} does not accept props of the given type.`;
  }

  static decoratorCanBeApplied(targetText: string): string {
    return `The decorator function can be applied${targetText}.`;
  }

  static decoratorCanNotBeApplied(targetText: string): string {
    return `The decorator function can not be applied${targetText}.`;
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

  static typeDidNotRaiseError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} did not raise a type error.`;
  }

  static typeDidNotRaiseMatchingError(isTypeNode: boolean): string {
    return `${isTypeNode ? "Type" : "Expression type"} did not raise a matching type error.`;
  }

  static typeDoesNotHaveProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' does not have property '${propertyNameText}'.`;
  }

  static typeHasProperty(typeText: string, propertyNameText: string): string {
    return `Type '${typeText}' has property '${propertyNameText}'.`;
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
      countText = count > targetCount ? `${count}` : `only ${count}`;
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

  static typeWasRejected(typeText: string): Array<string> {
    const optionNameText = `reject${Format.capitalize(typeText)}Type`;

    return [
      `The '${typeText}' type was rejected because the '${optionNameText}' option is enabled.`,
      `If this check is necessary, pass '${typeText}' as the type argument explicitly.`,
    ];
  }
}
