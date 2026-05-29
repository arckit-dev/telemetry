import { describe, expect, it } from 'vitest';
import type { ErrorCapture, ErrorReporter } from './error-reporter';
import { createInstrument } from './instrument';
import type { Measurement, Metrics, SpanAttributes } from './metrics';
import { noopMetrics } from './metrics';
import { noopTracer, type Tracer } from './tracer';

const silentReporter: ErrorReporter = {
  captureException: () => ({}),
  captureMessage: () => ({})
};

const capturingMetrics = (): { metrics: Metrics; recorded: Promise<SpanAttributes> } => {
  const { promise, resolve } = Promise.withResolvers<SpanAttributes>();
  const measure = (_value: number, attributes?: SpanAttributes): Measurement => {
    resolve(attributes ?? {});
    return { instrumentName: 'x', value: _value, attributes: attributes ?? {} };
  };
  const metrics: Metrics = {
    counter: () => ({ add: measure }),
    histogram: () => ({ record: measure }),
    gauge: () => ({ record: measure })
  };
  return { metrics, recorded: promise };
};

const capturingReporter = (): { reporter: ErrorReporter; captured: Promise<ErrorCapture> } => {
  const { promise, resolve } = Promise.withResolvers<ErrorCapture>();
  const reporter: ErrorReporter = {
    captureException: (capture: ErrorCapture) => {
      resolve(capture);
      return {};
    },
    captureMessage: () => ({})
  };
  return { reporter, captured: promise };
};

const failing: Tracer = {
  startSpan: async <T>(_name: string, fn: (span: never) => T | Promise<T>): Promise<T> => fn(undefined as never)
};

describe('createInstrument success path', () => {
  it('returns the value produced by the wrapped operation', async () => {
    const instrument = createInstrument({ tracer: noopTracer(), metrics: noopMetrics(), errorReporter: silentReporter });
    const result = await instrument({ name: 'op', service: 'svc' }, async () => 42);
    expect(result).toBe(42);
  });

  it('tags the call metric with a success status', async () => {
    const { metrics, recorded } = capturingMetrics();
    const instrument = createInstrument({ tracer: noopTracer(), metrics, errorReporter: silentReporter });
    await instrument({ name: 'op', service: 'svc' }, async () => undefined);
    expect((await recorded)['status']).toBe('success');
  });

  it('tags the call metric with the service name', async () => {
    const { metrics, recorded } = capturingMetrics();
    const instrument = createInstrument({ tracer: noopTracer(), metrics, errorReporter: silentReporter });
    await instrument({ name: 'op', service: 'recherche-entreprises' }, async () => undefined);
    expect((await recorded)['service']).toBe('recherche-entreprises');
  });
});

describe('createInstrument error path', () => {
  it('reports the thrown exception', async () => {
    const { reporter, captured } = capturingReporter();
    const instrument = createInstrument({ tracer: failing, metrics: noopMetrics(), errorReporter: reporter });
    await instrument({ name: 'op', service: 'svc' }, async () => {
      throw new Error('boom');
    }).catch(() => undefined);
    expect((await captured).error?.message).toBe('boom');
  });

  it('fingerprints the exception by service and error name', async () => {
    const { reporter, captured } = capturingReporter();
    const instrument = createInstrument({ tracer: failing, metrics: noopMetrics(), errorReporter: reporter });
    await instrument({ name: 'op', service: 'svc' }, async () => {
      throw Object.assign(new Error('boom'), { name: 'HttpError' });
    }).catch(() => undefined);
    expect((await captured).fingerprint).toEqual(['svc', 'HttpError']);
  });

  it('rethrows the original error', async () => {
    const instrument = createInstrument({ tracer: failing, metrics: noopMetrics(), errorReporter: silentReporter });
    const error = new Error('boom');
    await expect(
      instrument({ name: 'op', service: 'svc' }, async () => {
        throw error;
      })
    ).rejects.toBe(error);
  });
});
