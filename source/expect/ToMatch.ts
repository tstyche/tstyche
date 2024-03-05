import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToMatch extends RelationMatcherBase {
  relation = this.typeChecker.relation.subtype;
  relationExplanationText = "match";
  override relationExplanationVerb = "does";
}
