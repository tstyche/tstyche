import { spawnSync } from "node:child_process";
import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { Bench } from "tinybench";

/**
 * @param {Array<string>} [args]
 */
function spawnTyche(args) {
  const { error, status } = spawnSync("tstyche", args);

  if (error != null) {
    throw error;
  }

  return { status };
}

const bench = withCodSpeed(new Bench());

bench
  .add("small run with default target", () => {
    spawnTyche(["examples"]);
  })
  .add("small run with three targets", () => {
    spawnTyche(["examples", "--target 4.9,5.3,current"]);
  })
  .add("large run with default target", () => {
    spawnTyche();
  })
  .add("large run with three targets", () => {
    spawnTyche(["--target 4.9,5.3,current"]);
  });

await bench.run();

console.table(bench.table());
