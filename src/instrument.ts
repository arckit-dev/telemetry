import type { ErrorReporter } from './error-reporter';
import type { Metrics } from './metrics';
import type { SpanAttributes, Tracer } from './tracer';

type InstrumentDeps = {
  readonly tracer: Tracer;
  readonly metrics: Metrics;
  readonly errorReporter: ErrorReporter;
};

type Operation = {
  readonly name: string;
  readonly service: string;
  readonly attributes?: SpanAttributes | undefined;
};

export type Instrument = <T>(operation: Operation, run: () => Promise<T>) => Promise<T>;

const toError = (caught: unknown): Error => (caught instanceof Error ? caught : new Error(String(caught)));

export const createInstrument = ({ tracer, metrics, errorReporter }: InstrumentDeps): Instrument => {
  const calls = metrics.counter('external.calls_total', { description: 'External service calls' });
  const duration = metrics.histogram('external.duration_ms', { description: 'External service call duration', unit: 'ms' });

  return async <T>({ name, service, attributes }: Operation, run: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const spanAttributes: SpanAttributes = { 'service.name': service, ...attributes };
    try {
      const result = await tracer.startSpan(name, run, { kind: 'client', attributes: spanAttributes });
      calls.add(1, { service, status: 'success' });
      duration.record(performance.now() - start, { service, status: 'success' });
      return result;
    } catch (caught) {
      calls.add(1, { service, status: 'error' });
      duration.record(performance.now() - start, { service, status: 'error' });
      const error = toError(caught);
      errorReporter.captureException({ error, attributes: spanAttributes, fingerprint: [service, error.name] });
      throw caught;
    }
  };
};
