import { type Attributes, metrics as otelMetricsApi } from '@opentelemetry/api';
import type { ContextGetters } from '../context';
import type { SpanAttributes } from '../tracer';
import { buildMeasurement } from './build-measurement';
import type { Counter, Gauge, Histogram, InstrumentOptions, Measurement, Metrics } from './metrics.type';

export type CreateOtelMetricsOptions = {
  readonly namespace: string;
  readonly meterName?: string;
} & ContextGetters;

const toOtelAttributes = (attributes: SpanAttributes): Attributes =>
  Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])
  ) as Attributes;

export const createOtelMetrics = ({
  namespace,
  meterName = 'arckit-telemetry',
  ...getters
}: CreateOtelMetricsOptions): Metrics => {
  const meter = otelMetricsApi.getMeter(meterName);

  const recordMeasurement = (
    instrumentName: string,
    value: number,
    attributes: SpanAttributes | undefined,
    forward: (value: number, attrs: Attributes) => void
  ): Measurement => {
    const measurement = buildMeasurement({
      instrumentName,
      value,
      namespace,
      attributes,
      scope: getters.getScope?.(),
      identity: getters.getIdentity?.()
    });
    forward(value, toOtelAttributes(measurement.attributes));
    return measurement;
  };

  return {
    counter: (name: string, options?: InstrumentOptions): Counter => {
      const instrument = meter.createCounter(name, options);
      return { add: (value, attrs) => recordMeasurement(name, value, attrs, (v, a) => instrument.add(v, a)) };
    },
    histogram: (name: string, options?: InstrumentOptions): Histogram => {
      const instrument = meter.createHistogram(name, options);
      return { record: (value, attrs) => recordMeasurement(name, value, attrs, (v, a) => instrument.record(v, a)) };
    },
    gauge: (name: string, options?: InstrumentOptions): Gauge => {
      const instrument = meter.createGauge(name, options);
      return { record: (value, attrs) => recordMeasurement(name, value, attrs, (v, a) => instrument.record(v, a)) };
    }
  };
};
