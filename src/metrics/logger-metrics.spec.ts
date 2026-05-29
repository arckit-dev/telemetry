import { describe, expect, it } from 'vitest';
import type { LogEntry, Logger, LogRecord } from '../logger';
import { buildLogRecord } from '../logger/build-log-record';
import { createLoggerMetrics } from './logger-metrics';

const capturingLogger = (): { logger: Logger; recorded: Promise<LogRecord> } => {
  const { promise, resolve } = Promise.withResolvers<LogRecord>();
  const logger: Logger = {
    log: (entry: LogEntry): LogRecord => {
      const record = buildLogRecord(entry);
      resolve(record);
      return record;
    }
  };
  return { logger, recorded: promise };
};

describe('createLoggerMetrics counter', () => {
  it('emits a metric.counter event when add is called', async () => {
    const { logger, recorded } = capturingLogger();
    createLoggerMetrics({ logger, namespace: 'app' }).counter('items_total').add(1);
    expect((await recorded).event).toBe('metric.counter');
  });

  it('records the instrument name', async () => {
    const { logger, recorded } = capturingLogger();
    createLoggerMetrics({ logger, namespace: 'app' }).counter('items_total').add(1);
    expect((await recorded)['metric.name']).toBe('items_total');
  });

  it('records the added value', async () => {
    const { logger, recorded } = capturingLogger();
    createLoggerMetrics({ logger, namespace: 'app' }).counter('items_total').add(3);
    expect((await recorded)['metric.value']).toBe(3);
  });
});

describe('createLoggerMetrics histogram', () => {
  it('emits a metric.histogram event when record is called', async () => {
    const { logger, recorded } = capturingLogger();
    createLoggerMetrics({ logger, namespace: 'app' }).histogram('latency_ms').record(42);
    expect((await recorded).event).toBe('metric.histogram');
  });
});

describe('createLoggerMetrics gauge', () => {
  it('emits a metric.gauge event when record is called', async () => {
    const { logger, recorded } = capturingLogger();
    createLoggerMetrics({ logger, namespace: 'app' }).gauge('queue_depth').record(7);
    expect((await recorded).event).toBe('metric.gauge');
  });
});
