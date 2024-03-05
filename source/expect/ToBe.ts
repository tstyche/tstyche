import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToBe extends RelationMatcherBase {
  relation = this.typeChecker.relation.identity;
  relationExplanationText = "identical to";
}
