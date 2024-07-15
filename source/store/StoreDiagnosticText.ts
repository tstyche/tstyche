export class StoreDiagnosticText {
  static failedToFetchMetadata(registryUrl: URL): string {
    return `Failed to fetch metadata of the 'typescript' package from '${registryUrl.toString()}'.`;
  }

  static failedWithStatusCode(code: number): string {
    return `Request failed with status code ${code}.`;
  }

  static maybeNetworkConnectionIssue(): string {
    return "Might be there is an issue with the registry or the network connection.";
  }

  static setupTimeoutExceeded(timeout: number): string {
    return `Setup timeout of ${timeout / 1000}s was exceeded.`;
  }
}
