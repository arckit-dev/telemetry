import type { ContextGetters } from '../context';
import type { Logger } from '../logger';
import type { SpanAttributes } from '../tracer';
import { buildMeasurement } from './build-measurement';
import type { Counter, Gauge, Histogram, InstrumentOptions, Measurement, Metrics } from './metrics.type';

type CreateLoggerMetricsOptions = {
  readonly logger: Logger;
  readonly namespace: string;
} & ContextGetters;

type InstrumentType = 'counter' | 'histogram' | 'gauge';

export const createLoggerMetrics = ({ logger, namespace, ...getters }: CreateLoggerMetricsOptions): Metrics => {
  const emit = (
    instrumentName: string,
    instrumentType: InstrumentType,
    value: number,
    attributes: SpanAttributes | undefined
  ): Measurement => {
    const measurement = buildMeasurement({
      instrumentName,
      value,
      namespace,
      attributes,
      scope: getters.getScope?.(),
      identity: getters.getIdentity?.()
    });
    logger.log({
      level: 'debug',
      event: `metric.${instrumentType}`,
      attributes: { 'metric.name': instrumentName, 'metric.value': value, ...measurement.attributes }
    });
    return measurement;
  };
  return {
    counter: (name: string, _options?: InstrumentOptions): Counter => ({
      add: (value: number, attrs?: SpanAttributes) => emit(name, 'counter', value, attrs)
    }),
    histogram: (name: string, _options?: InstrumentOptions): Histogram => ({
      record: (value: number, attrs?: SpanAttributes) => emit(name, 'histogram', value, attrs)
    }),
    gauge: (name: string, _options?: InstrumentOptions): Gauge => ({
      record: (value: number, attrs?: SpanAttributes) => emit(name, 'gauge', value, attrs)
    })
  };
};
