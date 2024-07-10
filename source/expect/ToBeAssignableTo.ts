import type { MatchWorker } from "./MatchWorker.js";
import type { MatchResult } from "./types.js";

export class ToBeAssignableTo {
  match(matchWorker: MatchWorker): MatchResult {
    return {
      explain: () => matchWorker.explainIsAssignableTo(),
      isMatch: matchWorker.checkIsAssignableTo(),
    };
  }
}
