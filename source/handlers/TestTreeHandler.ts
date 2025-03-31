import { type TestTree, TestTreeNodeFlags } from "#collect";
import type { Event, EventHandler } from "#events";

export class TestTreeHandler implements EventHandler {
  testTree: TestTree | undefined;

  on([event, payload]: Event): void {
    switch (event) {
      case "collect:start":
        this.testTree = payload.testTree;
        break;

      case "collect:end":
        this.testTree = undefined;
        break;

      case "collect:node":
        if (payload.testNode.flags & TestTreeNodeFlags.Only) {
          this.testTree!.hasOnly = true;
        }
        break;
    }
  }
}
