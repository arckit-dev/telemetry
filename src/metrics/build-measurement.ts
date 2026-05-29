import type { Identity, TelemetryScope } from '../context';
import { buildSpanAttributes, type SpanAttributes } from '../tracer';
import type { Measurement } from './metrics.type';

type BuildMeasurementInput = {
  readonly instrumentName: string;
  readonly value: number;
  readonly namespace: string;
  readonly attributes?: SpanAttributes | undefined;
  readonly scope?: TelemetryScope | undefined;
  readonly identity?: Identity | undefined;
};

export const buildMeasurement = ({
  instrumentName,
  value,
  namespace,
  attributes,
  scope,
  identity
}: BuildMeasurementInput): Measurement => ({
  instrumentName,
  value,
  attributes: buildSpanAttributes({ namespace, attributes, scope, identity })
});
