class CustomReporter {
  /**
   * @param {import("tstyche/tstyche").ReporterEvent} event
   */
  on([event]) {
    if (event === "run:start") {
      console.info("Hello from custom reporter two!");
    }

    if (event === "run:end") {
      console.info("Bye from custom reporter two!");
    }
  }
}

export default CustomReporter;
