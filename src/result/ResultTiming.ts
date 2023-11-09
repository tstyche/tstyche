export class ResultTiming {
  end = Date.now();
  start = Date.now();

  get duration(): number {
    return this.end - this.start;
  }
}
