export default class CustomReporter {
  /**
   * @param {import("tstyche/api").ResolvedConfig} resolvedConfig
   */
  constructor(resolvedConfig) {
    this.resolvedConfig = resolvedConfig;
  }

  /**
   * @param {import("tstyche/api").ReporterEvent} reporterEvent
   */
  on([event, payload]) {
    if (event === "run:start") {
      console.info("Hello from custom reporter!");

      for (const file of payload.result.files) {
        console.info(file.path);
      }
    }
  }
}
