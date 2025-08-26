export class ResultCount {
  failed = 0;
  passed = 0;
  skipped = 0;
  fixme = 0;
  todo = 0;

  get total(): number {
    return this.failed + this.passed + this.skipped + this.todo;
  }
}
