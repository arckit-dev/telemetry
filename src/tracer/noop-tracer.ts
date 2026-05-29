import type { Span, Tracer } from './tracer.type';

const noopSpan: Span = {
  setAttribute: () => undefined,
  recordException: () => undefined,
  setStatus: () => undefined,
  end: () => undefined
};

export const noopTracer = (): Tracer => ({
  startSpan: async <T>(_name: string, fn: (span: Span) => T | Promise<T>): Promise<T> => fn(noopSpan)
});
