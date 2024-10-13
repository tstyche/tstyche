import type { ResolvedConfig } from "#config";

import type { OutputService } from "#output";
import { Runner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { Task } from "#task";
import { CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  #outputService: OutputService;
  #resolvedConfig: ResolvedConfig;
  #runner: Runner;
  #selectService: SelectService;
  #storeService: StoreService;
  static version = "__version__";

  constructor(
    resolvedConfig: ResolvedConfig,
    outputService: OutputService,
    selectService: SelectService,
    storeService: StoreService,
  ) {
    this.#resolvedConfig = resolvedConfig;
    this.#outputService = outputService;
    this.#selectService = selectService;
    this.#storeService = storeService;
    this.#runner = new Runner(this.#resolvedConfig, this.#outputService, this.#selectService, this.#storeService);
  }

  // TODO perhaps it could be a static method that constructs runner instance? CLI should use the 'Runner' class directly.
  //      Or this class can be simply removed in favour of the 'Runner' class.
  async run(testFiles: Array<string | URL>, cancellationToken = new CancellationToken()): Promise<void> {
    await this.#runner.run(
      testFiles.map((testFile) => new Task(testFile)),
      cancellationToken,
    );
  }
}
