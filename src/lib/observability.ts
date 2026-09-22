export type LogLevel = "debug" | "info" | "warn" | "error";
export interface ObservabilityEvent { name: string; tags?: Record<string, string>; durationMs?: number; }

export interface ObservabilityProvider {
  log: (level: LogLevel, message: string, context?: Record<string, unknown>) => void;
  captureError: (error: Error, context?: Record<string, unknown>) => void;
  recordMetric: (event: ObservabilityEvent) => void;
}

export const consoleObservability: ObservabilityProvider = {
  log(level, message, context) {
    if (process.env.NODE_ENV !== "test") console[level](message, context ?? {});
  },
  captureError(error, context) {
    if (process.env.NODE_ENV !== "test") console.error(error.message, context ?? {});
  },
  recordMetric(event) {
    if (process.env.NODE_ENV !== "test") console.info("metric", event);
  }
};

export const observability = consoleObservability;
