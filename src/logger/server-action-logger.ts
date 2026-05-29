import { buildLogRecord } from './build-log-record';
import type { LogEntry, Logger, LogRecord } from './logger.type';

export type LogClientAction = (entry: LogEntry) => Promise<void>;

export const serverActionLogger = (action: LogClientAction): Logger => ({
  log: (entry: LogEntry): LogRecord => {
    action(entry).catch(() => undefined);
    return buildLogRecord({ ...entry });
  }
});
