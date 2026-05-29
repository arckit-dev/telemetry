import type { ContextGetters } from '../context';
import type { Logger } from '../logger';
import { buildSpanAttributes } from './build-span-attributes';
import type { Span, StartSpanOptions, Tracer } from './tracer.type';

type CreateLoggerTracerOptions = {
  readonly logger: Logger;
  readonly namespace: string;
} & ContextGetters;

const noopSpan: Span = {
  setAttribute: () => undefined,
  recordException: () => undefined,
  setStatus: () => undefined,
  end: () => undefined
};

export const createLoggerTracer = ({ logger, namespace, ...getters }: CreateLoggerTracerOptions): Tracer => ({
  startSpan: async <T>(name: string, fn: (span: Span) => T | Promise<T>, options?: StartSpanOptions): Promise<T> => {
    const start = performance.now();
    const baseAttributes = buildSpanAttributes({
      namespace,
      attributes: options?.attributes,
      scope: getters.getScope?.(),
      identity: getters.getIdentity?.()
    });
    try {
      const result = await fn(noopSpan);
      logger.log({
        level: 'debug',
        event: `${name}:end`,
        attributes: { 'span.name': name, 'span.duration_ms': performance.now() - start, 'span.status': 'ok', ...baseAttributes }
      });
      return result;
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error(String(caught));
      logger.log({
        level: 'error',
        event: `${name}:end`,
        error,
        attributes: {
          'span.name': name,
          'span.duration_ms': performance.now() - start,
          'span.status': 'error',
          ...baseAttributes
        }
      });
      throw caught;
    }
  }
});
