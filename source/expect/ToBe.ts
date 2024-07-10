import type { MatchWorker } from "./MatchWorker.js";
import type { MatchResult } from "./types.js";

export class ToBe {
  match(matchWorker: MatchWorker): MatchResult {
    return {
      explain: () => matchWorker.explainIsIdenticalTo(),
      isMatch: matchWorker.checkIsIdenticalTo(),
    };
  }
}
