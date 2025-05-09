import { BaseReporter, type ReporterEvent } from "tstyche/tstyche";

export default class CustomReporter extends BaseReporter {
  on([event, payload]: ReporterEvent) {
    if (event === "run:start") {
      console.info("Hello from custom reporter!");

      for (const task of payload.result.tasks) {
        console.info(task.filePath);
      }
    }
  }
}
