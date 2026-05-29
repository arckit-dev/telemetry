import type { SpanAttributes } from '../tracer';

export type Measurement = Readonly<{
  instrumentName: string;
  value: number;
  attributes: SpanAttributes;
}>;

export type InstrumentOptions = {
  readonly description?: string;
  readonly unit?: string;
};

export type Counter = {
  readonly add: (value: number, attributes?: SpanAttributes) => Measurement;
};

export type Histogram = {
  readonly record: (value: number, attributes?: SpanAttributes) => Measurement;
};

export type Gauge = {
  readonly record: (value: number, attributes?: SpanAttributes) => Measurement;
};

export type Metrics = {
  readonly counter: (name: string, options?: InstrumentOptions) => Counter;
  readonly histogram: (name: string, options?: InstrumentOptions) => Histogram;
  readonly gauge: (name: string, options?: InstrumentOptions) => Gauge;
};
