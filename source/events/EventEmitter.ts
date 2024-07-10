import type { Event } from "./types.js";

export interface EventHandler {
  handleEvent: (event: Event) => void;
}

export class EventEmitter {
  static #handlers = new Set<EventHandler>();
  #scopeHandlers = new Set<EventHandler>();

  addHandler(handler: EventHandler): void {
    this.#scopeHandlers.add(handler);
    EventEmitter.#handlers.add(handler);
  }

  static dispatch(event: Event): void {
    for (const handler of EventEmitter.#handlers) {
      handler.handleEvent(event);
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
