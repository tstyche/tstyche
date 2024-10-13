import type { Event } from "#events";

export interface Reporter {
  on: (event: ReporterEvent) => void;
}

export type ReporterEvent = Exclude<Event, ["config:error" | "select:error", {}]>;
