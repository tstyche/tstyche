import type { SuppressedError } from "#layers";

export class SuppressedResult {
  suppressed: SuppressedError;

  constructor(suppressed: SuppressedError) {
    this.suppressed = suppressed;
  }
}
