import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { Bench } from "tinybench";
import { Cli } from "tstyche/tstyche";

const bench = withCodSpeed(new Bench({ iterations: 8 }));

bench
  .add("run examples with default target", async () => {
    const cli = new Cli(process);
    await cli.run(["examples"]);
  })
  .add("run examples using TypeScript 4.9", async () => {
    const cli = new Cli(process);
    await cli.run(["examples", "--target", "4.9"]);
  })
  .add("run examples using TypeScript 5.2", async () => {
    const cli = new Cli(process);
    await cli.run(["examples", "--target", "5.2"]);
  });

await bench.run();

console.table(bench.table());
