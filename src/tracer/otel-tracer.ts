import { type Attributes, type Span as OtelSpan, SpanKind as OtelSpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Span, SpanAttributes, SpanKind, SpanStatus, StartSpanOptions, Tracer } from './tracer.type';

const toOtelAttributes = (attributes: SpanAttributes): Attributes =>
  Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])
  ) as Attributes;

const SPAN_KIND: Readonly<Record<SpanKind, OtelSpanKind>> = {
  internal: OtelSpanKind.INTERNAL,
  server: OtelSpanKind.SERVER,
  client: OtelSpanKind.CLIENT,
  producer: OtelSpanKind.PRODUCER,
  consumer: OtelSpanKind.CONSUMER
};

const SPAN_STATUS: Readonly<Record<SpanStatus, SpanStatusCode>> = {
  unset: SpanStatusCode.UNSET,
  ok: SpanStatusCode.OK,
  error: SpanStatusCode.ERROR
};

const wrapSpan = (otelSpan: OtelSpan): Span => ({
  setAttribute: (key, value) => {
    otelSpan.setAttribute(key, value as string | number | boolean);
  },
  recordException: (error) => {
    otelSpan.recordException(error);
  },
  setStatus: (status, description) => {
    otelSpan.setStatus({ code: SPAN_STATUS[status], ...(description ? { message: description } : {}) });
  },
  end: () => {
    otelSpan.end();
  }
});

export const otelTracer = (instrumentationName = 'arckit-telemetry'): Tracer => {
  const tracer = trace.getTracer(instrumentationName);
  return {
    startSpan: <T>(name: string, fn: (span: Span) => T | Promise<T>, options?: StartSpanOptions): Promise<T> =>
      tracer.startActiveSpan(
        name,
        {
          ...(options?.kind ? { kind: SPAN_KIND[options.kind] } : {}),
          ...(options?.attributes ? { attributes: toOtelAttributes(options.attributes) } : {})
        },
        async (otelSpan): Promise<T> => {
          const span = wrapSpan(otelSpan);
          try {
            const result = await fn(span);
            otelSpan.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (caught) {
            const error = caught instanceof Error ? caught : new Error(String(caught));
            otelSpan.recordException(error);
            otelSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            throw caught;
          } finally {
            otelSpan.end();
          }
        }
      ) as Promise<T>
  };
};
