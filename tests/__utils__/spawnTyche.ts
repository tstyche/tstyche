import { spawnSync } from "node:child_process";
import { getFixtureUrl } from "./getFixtureUrl.js";

function normalizeOutput(output: string) {
  return output
    .replaceAll(process.cwd().replace(/\\/g, "/"), "<<cwd>>")
    .replaceAll(/(Duration:\s{2})\s((?:\d\.?)+s)/g, "$1 <<timestamp>>")
    .replaceAll(/(uses TypeScript)\s(\d\.?)+/g, "$1 <<version>>");
}

export function spawnTyche(
  fixture: string,
  args?: Array<string>,
): { status: number | null; stderr: string; stdout: string } {
  const { error, status, stderr, stdout } = spawnSync("tstyche", args, {
    cwd: getFixtureUrl(fixture),
    env: {
      ...process.env,
      ["TSTYCHE_NO_COLOR"]: "on",
    },
    shell: true,
    windowsVerbatimArguments: true,
  });

  if (error) {
    throw error;
  }

  return {
    status,
    stderr: normalizeOutput(stderr.toString()),
    stdout: normalizeOutput(stdout.toString()),
  };
}
