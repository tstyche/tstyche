import type { Reporter } from "#reporters";
import type { Event, EventHandler } from "./types.js";

export class EventEmitter {
  static #handlers = new Set<EventHandler>();
  #scopeHandlers = new Set<EventHandler>();
  static #reporters = new Set<EventHandler>();

  addHandler(handler: EventHandler): void {
    this.#scopeHandlers.add(handler);
    EventEmitter.#handlers.add(handler);
  }

  addReporter(reporter: Reporter): void {
    EventEmitter.#reporters.add(reporter as EventHandler);
  }

  static dispatch(event: Event): void {
    for (const handler of [...EventEmitter.#handlers, ...EventEmitter.#reporters]) {
      handler.on(event);
    }
  }

  removeHandler(handler: EventHandler): void {
    this.#scopeHandlers.delete(handler);
    EventEmitter.#handlers.delete(handler);
  }

  removeReporter(reporter: Reporter): void {
    EventEmitter.#reporters.delete(reporter as EventHandler);
  }

  removeHandlers(): void {
    for (const handler of this.#scopeHandlers) {
      EventEmitter.#handlers.delete(handler);
    }

    this.#scopeHandlers.clear();
  }
}
