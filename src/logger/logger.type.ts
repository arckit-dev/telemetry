export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type AttributeValue = string | number | boolean | ReadonlyArray<string | number | boolean>;

export type LogAttributes = Readonly<Record<string, AttributeValue>>;

export type LogEntry = {
  readonly level: LogLevel;
  readonly event: string;
  readonly attributes?: LogAttributes;
  readonly error?: Error;
};

export type LogRecord = Readonly<Record<string, unknown>>;

export type Logger = {
  readonly log: (entry: LogEntry) => LogRecord;
};
