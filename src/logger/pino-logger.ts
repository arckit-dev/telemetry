import pinoFactory, { type DestinationStream, type LoggerOptions } from 'pino';
import type { ContextGetters } from '../context';
import { buildLogRecord } from './build-log-record';
import type { LogEntry, Logger, LogRecord } from './logger.type';

type CreatePinoLoggerOptions = {
  readonly options?: LoggerOptions;
  readonly destination?: DestinationStream;
} & ContextGetters;

export const createPinoLogger = ({ options = {}, destination, ...getters }: CreatePinoLoggerOptions = {}): Logger => {
  const instance = destination ? pinoFactory(options, destination) : pinoFactory(options);

  return {
    log: (entry: LogEntry): LogRecord => {
      const record = buildLogRecord({
        ...entry,
        scope: getters.getScope?.(),
        identity: getters.getIdentity?.(),
        trace: getters.getTrace?.()
      });
      instance[entry.level](record);
      return record;
    }
  };
};
