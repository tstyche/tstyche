import type { Event, EventHandler } from "./types.js";

export class EventEmitter {
  static #handlers = new Set<EventHandler>();
  #scopeHandlers = new Set<EventHandler>();

  addHandler(handler: EventHandler): void {
    this.#scopeHandlers.add(handler);
    EventEmitter.#handlers.add(handler);
  }

  static dispatch(event: Event): void {
    for (const handler of EventEmitter.#handlers) {
      handler.on(event);
    }
  }

  removeHandler(handler: EventHandler): void {
    this.#scopeHandlers.delete(handler);
    EventEmitter.#handlers.delete(handler);
  }

  removeHandlers(): void {
    for (const handler of this.#scopeHandlers) {
      EventEmitter.#handlers.delete(handler);
    }

    this.#scopeHandlers.clear();
  }
}
