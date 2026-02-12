import { Path } from "#path";

export class CliDiagnosticText {
  static configLocationChanged(oldConfigFilePath: string, newConfigFilePath: string) {
    return [
      "The default configuration file location has changed.",
      `The discovered file has been automatically renamed from '${Path.relative(".", oldConfigFilePath)}' to '${Path.relative(".", newConfigFilePath)}'.`,
    ];
  }
}
