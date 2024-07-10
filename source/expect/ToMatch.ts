import type { MatchWorker } from "./MatchWorker.js";
import type { MatchResult } from "./types.js";

export class ToMatch {
  match(matchWorker: MatchWorker): MatchResult {
    return {
      explain: () => matchWorker.explainDoesMatch(),
      isMatch: matchWorker.checkDoesMatch(),
    };
  }
}
