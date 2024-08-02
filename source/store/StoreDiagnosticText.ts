export class StoreDiagnosticText {
  static cannotAddTypeScriptPackage(tag: string): string {
    return `Cannot add the 'typescript' package for the '${tag}' tag.`;
  }

  static failedToFetchMetadata(registry: string): string {
    return `Failed to fetch metadata of the 'typescript' package from '${registry}'.`;
  }

  static failedToInstalTypeScript(version: string): string {
    return `Failed to install 'typescript@${version}'.`;
  }

  static failedToUpdateMetadata(registry: string): string {
    return `Failed to update metadata of the 'typescript' package from '${registry}'.`;
  }

  static maybeNetworkConnectionIssue(): string {
    return "Might be there is an issue with the registry or the network connection.";
  }

  static maybeOutdatedResolution(tag: string): string {
    return `The resolution of the '${tag}' tag may be outdated.`;
  }

  static requestFailedWithStatusCode(code: number): string {
    return `The request failed with status code ${code}.`;
  }

  static requestTimeoutWasExceeded(timeout: number): string {
    return `The request timeout of ${timeout / 1000}s was exceeded.`;
  }
}
