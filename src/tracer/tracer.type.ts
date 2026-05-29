import type { AttributeValue } from '../logger';

export type SpanKind = 'internal' | 'server' | 'client' | 'producer' | 'consumer';

export type SpanStatus = 'unset' | 'ok' | 'error';

export type SpanAttributes = Readonly<Record<string, AttributeValue>>;

export type Span = {
  readonly setAttribute: (key: string, value: AttributeValue) => void;
  readonly recordException: (error: Error) => void;
  readonly setStatus: (status: SpanStatus, description?: string) => void;
  readonly end: () => void;
};

export type StartSpanOptions = {
  readonly kind?: SpanKind | undefined;
  readonly attributes?: SpanAttributes | undefined;
};

export type Tracer = {
  readonly startSpan: <T>(name: string, fn: (span: Span) => T | Promise<T>, options?: StartSpanOptions) => Promise<T>;
};
