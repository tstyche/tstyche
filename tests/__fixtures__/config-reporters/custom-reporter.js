class CustomReporter {
  /**
   * @param {import("tstyche/tstyche").ReporterEvent} event
   */
  on([event, payload]) {
    if (event === "run:start") {
      console.info("Hello from custom reporter one!");
      console.info("");

      for (const task of payload.result.tasks) {
        console.info(task.filePath);
      }

      console.info("");
    }
  }
}

export default CustomReporter;
