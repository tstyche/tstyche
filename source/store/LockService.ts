import { existsSync } from "node:fs";
import type { Diagnostic } from "#diagnostic";
import type { CancellationToken } from "#token";
import { Lock } from "./Lock.js";
import { StoreDiagnosticText } from "./StoreDiagnosticText.js";
import type { DiagnosticsHandler } from "./types.js";

export class LockService {
  #onDiagnostics: DiagnosticsHandler;

  constructor(onDiagnostics: DiagnosticsHandler) {
    this.#onDiagnostics = onDiagnostics;
  }

  #getLockFilePath(targetPath: string) {
    return `${targetPath}__lock__`;
  }

  getLock(targetPath: string): Lock {
    const lockFilePath = this.#getLockFilePath(targetPath);

    return new Lock(lockFilePath);
  }

  async isLocked(
    targetPath: string,
    timeout: number,
    diagnostic: Diagnostic,
    cancellationToken?: CancellationToken,
  ): Promise<boolean> {
    const lockFilePath = this.#getLockFilePath(targetPath);

    let isLocked = existsSync(lockFilePath);

    if (!isLocked) {
      return isLocked;
    }

    const waitStartTime = Date.now();

    while (isLocked) {
      if (cancellationToken?.isCancellationRequested === true) {
        break;
      }

      if (Date.now() - waitStartTime > timeout) {
        this.#onDiagnostics(diagnostic.extendWith(StoreDiagnosticText.lockWaitTimeoutWasExceeded(timeout)));

        break;
      }

      await this.#sleep(1000);

      isLocked = existsSync(lockFilePath);
    }

    return isLocked;
  }

  async #sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
