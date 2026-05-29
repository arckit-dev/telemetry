import type { ContextGetters } from '../context';
import { buildLogRecord } from './build-log-record';
import type { LogEntry, Logger, LogLevel, LogRecord } from './logger.type';

const CONSOLE_METHOD: Readonly<Record<LogLevel, 'debug' | 'log' | 'warn' | 'error'>> = {
  trace: 'debug',
  debug: 'debug',
  info: 'log',
  warn: 'warn',
  error: 'error',
  fatal: 'error'
};

export const createConsoleLogger = ({ getScope, getIdentity, getTrace }: ContextGetters = {}): Logger => ({
  log: (entry: LogEntry): LogRecord => {
    const record = buildLogRecord({
      ...entry,
      scope: getScope?.(),
      identity: getIdentity?.(),
      trace: getTrace?.()
    });
    console[CONSOLE_METHOD[entry.level]](JSON.stringify({ time: new Date().toISOString(), ...record }));
    return record;
  }
});
