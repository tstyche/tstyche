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

  static matcherIsNotSupported(matcherNameText: string): string {
    return `The '.${matcherNameText}()' matcher is not supported.`;
  }

  static typeArgumentMustBeOf(argumentNameText: string, expectedText: string, receivedTypeText: string): string {
    return `A type argument for '${argumentNameText}' must be of ${expectedText}, received: '${receivedTypeText}'.`;
  }
}
