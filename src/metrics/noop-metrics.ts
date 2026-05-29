import type { SpanAttributes } from '../tracer';
import type { Counter, Gauge, Histogram, Measurement, Metrics } from './metrics.type';

const measure = (instrumentName: string, value: number, attributes: SpanAttributes | undefined): Measurement => ({
  instrumentName,
  value,
  attributes: attributes ?? {}
});

export const noopMetrics = (): Metrics => ({
  counter: (name: string): Counter => ({ add: (value, attrs) => measure(name, value, attrs) }),
  histogram: (name: string): Histogram => ({ record: (value, attrs) => measure(name, value, attrs) }),
  gauge: (name: string): Gauge => ({ record: (value, attrs) => measure(name, value, attrs) })
});
