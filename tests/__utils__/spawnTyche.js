import { spawnSync } from "node:child_process";
import { getFixtureUrl } from "./getFixtureUrl.js";

/**
 * @param {string} fixture
 * @param {Array<string>} [args]
 * @param {Record<string, string>} [env]
 */
export function spawnTyche(fixture, args, env) {
  const { error, status, stderr, stdout } = spawnSync("tstyche", args, {
    cwd: getFixtureUrl(fixture),
    env: {
      ...process.env,
      ["TSTYCHE_NO_COLOR"]: "on",
      ["TSTYCHE_STORE_PATH"]: "./.store",
      ...env,
    },
    shell: true,
    windowsVerbatimArguments: true,
  });

  if (error) {
    throw error;
  }

  return { status, stderr: stderr.toString(), stdout: stdout.toString() };
}
