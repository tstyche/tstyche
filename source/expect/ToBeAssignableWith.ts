import type { MatchWorker } from "./MatchWorker.js";
import type { MatchResult } from "./types.js";

export class ToBeAssignableWith {
  match(matchWorker: MatchWorker): MatchResult {
    return {
      explain: () => matchWorker.explainIsAssignableWith(),
      isMatch: matchWorker.checkIsAssignableWith(),
    };
  }
}
