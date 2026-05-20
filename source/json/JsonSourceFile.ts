// TODO replace with 'SourceFile'

export class JsonSourceFile {
  fileName: string;
  text: string;

  constructor(fileName: string, text: string) {
    this.fileName = fileName;
    this.text = text;
  }
}
