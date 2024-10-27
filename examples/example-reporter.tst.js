export default class CustomReporter {
  /**
   * @param {import("tstyche/tstyche").ResolvedConfig} resolvedConfig
   */
  constructor(resolvedConfig) {
    this.resolvedConfig = resolvedConfig;
  }

  /**
   * @param {import("tstyche/tstyche").Event} event
   */
  on([event, payload]) {
    if (event === "run:start") {
      console.info("Hello from custom reporter!");

      for (const task of payload.result.tasks) {
        console.info(task.filePath);
      }
    }
  }
}
