import type { Identity, TelemetryScope } from '../context';
import { identityAttributes } from '../otel-record';
import type { SpanAttributes } from './tracer.type';

type BuildSpanAttributesInput = {
  readonly namespace: string;
  readonly attributes?: SpanAttributes | undefined;
  readonly scope?: TelemetryScope | undefined;
  readonly identity?: Identity | undefined;
};

const scopeAttributes = (namespace: string, scope: TelemetryScope | undefined): Readonly<Record<string, string>> => {
  if (!scope) return {};
  if (scope.source === 'client') return { [`${namespace}.source`]: 'client', [`${namespace}.anonymous_id`]: scope.anonymousId };
  return { [`${namespace}.source`]: scope.source, [`${namespace}.request_id`]: scope.requestId };
};

export const buildSpanAttributes = ({ namespace, attributes, scope, identity }: BuildSpanAttributesInput): SpanAttributes => ({
  ...scopeAttributes(namespace, scope),
  ...identityAttributes(identity),
  ...attributes
});
