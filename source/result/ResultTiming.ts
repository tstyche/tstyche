export class ResultTiming {
  end = Number.NaN;
  start = Number.NaN;

  get duration(): number {
    return this.end - this.start;
  }
}
