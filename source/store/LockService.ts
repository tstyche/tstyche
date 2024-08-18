import { existsSync } from "node:fs";
import type { Diagnostic } from "#diagnostic";
import { Lock } from "./Lock.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import type { DiagnosticsHandler } from "./types.js";

export class LockService {
  #onDiagnostics: DiagnosticsHandler;
  #timeout: number;

  constructor(onDiagnostics: DiagnosticsHandler, timeout: number) {
    this.#onDiagnostics = onDiagnostics;
    this.#timeout = timeout;
  }

  #getLockFilePath(targetPath: string) {
    return `${targetPath}__lock__`;
  }

  getLock(targetPath: string): Lock {
    const lockFilePath = this.#getLockFilePath(targetPath);

    return new Lock(lockFilePath);
  }

  async isLocked(targetPath: string, diagnostic: Diagnostic): Promise<boolean> {
    const lockFilePath = this.#getLockFilePath(targetPath);

    let isLocked = existsSync(lockFilePath);

    if (!isLocked) {
      return isLocked;
    }

    const waitStartTime = Date.now();

    while (isLocked) {
      if (Date.now() - waitStartTime > this.#timeout) {
        this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.lockWaitTimeoutWasExceeded(this.#timeout)));

        break;
      }

      await this.#sleep(1000);

      isLocked = existsSync(lockFilePath);
    }

    return isLocked;
  }

  async #sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
