export class Format {
  static capitalize<const T extends string>(text: T): Capitalize<T> {
    return text.replace(/^./, text.charAt(0).toUpperCase()) as Capitalize<T>;
  }
}
