import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToBeAssignableTo extends RelationMatcherBase {
  relation = this.typeChecker.relation.assignable;
  relationExplanationText = "assignable to";
}
