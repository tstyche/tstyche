export class Format {
  static capitalize(text: string) {
    return text.replace(/^./, text.charAt(0).toUpperCase());
  }
}
