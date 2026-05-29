import { buildLogRecord } from './build-log-record';
import type { LogEntry, Logger, LogRecord } from './logger.type';

export const noopLogger = (): Logger => ({
  log: (entry: LogEntry): LogRecord => buildLogRecord(entry)
});
