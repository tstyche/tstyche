export class Previews {
  static #supportedFeatures: Array<string> = [];

  static getSupportedFeatures(): Array<string> {
    return Previews.#supportedFeatures;
  }

  static validateFeature(target: string): boolean {
    return Previews.#supportedFeatures.includes(target);
  }
}
