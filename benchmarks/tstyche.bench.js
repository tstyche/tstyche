import { spawnSync } from "node:child_process";
import { withCodSpeed } from "@codspeed/tinybench-plugin";
import { Bench } from "tinybench";

/**
 * @param {Array<string>} [args]
 */
function spawnTyche(args) {
  const { error, status, stdout } = spawnSync("tstyche", args, { shell: true });

  if (error != null) {
    throw error;
  }

  return { status, stdout };
}

const bench = withCodSpeed(new Bench({ iterations: 8 }));

bench
  .add("small run with default target", () => {
    spawnTyche(["examples"]);
  })
  .add("small run with three targets", () => {
    spawnTyche(["examples", "--target 4.9,5.2,current"]);
  })
  .add("large run with default target", () => {
    spawnTyche();
  })
  .add("large run with three targets", () => {
    spawnTyche(["--target 4.9,5.2,current"]);
  });

await bench.run();

console.table(bench.table());
