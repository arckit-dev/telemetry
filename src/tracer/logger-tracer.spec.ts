import { describe, expect, it } from 'vitest';
import type { LogEntry, Logger, LogRecord } from '../logger';
import { buildLogRecord } from '../logger/build-log-record';
import { createLoggerTracer } from './logger-tracer';

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

describe('createLoggerTracer', () => {
  it('returns the value produced by the wrapped function', async () => {
    const tracer = createLoggerTracer({ logger: capturingLogger().logger, namespace: 'app' });
    const result = await tracer.startSpan('test', () => 42);
    expect(result).toBe(42);
  });

  it('emits a debug log record once the span completes successfully', async () => {
    const { logger, recorded } = capturingLogger();
    const tracer = createLoggerTracer({ logger, namespace: 'app' });
    await tracer.startSpan('db.query', () => 'done');
    expect((await recorded).event).toBe('db.query:end');
  });

  it('tags the successful span with status ok', async () => {
    const { logger, recorded } = capturingLogger();
    const tracer = createLoggerTracer({ logger, namespace: 'app' });
    await tracer.startSpan('db.query', () => undefined);
    expect((await recorded)['span.status']).toBe('ok');
  });

  it('emits an error log record when the span throws', async () => {
    const { logger, recorded } = capturingLogger();
    const tracer = createLoggerTracer({ logger, namespace: 'app' });
    await tracer
      .startSpan('db.query', () => {
        throw new Error('boom');
      })
      .catch(() => undefined);
    expect((await recorded).severityText).toBe('ERROR');
  });

  it('tags the failed span with status error', async () => {
    const { logger, recorded } = capturingLogger();
    const tracer = createLoggerTracer({ logger, namespace: 'app' });
    await tracer
      .startSpan('db.query', () => {
        throw new Error('boom');
      })
      .catch(() => undefined);
    expect((await recorded)['span.status']).toBe('error');
  });
});
