import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToEqual extends RelationMatcherBase {
  relation = this.typeChecker.relation.identity;
  relationExplanationText = "identical to";
  relationExplanationVerb = "is";
}
