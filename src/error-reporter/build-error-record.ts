import type { Identity, TelemetryScope, Traced } from '../context';
import { exceptionAttributes, identityAttributes, SEVERITY_NUMBER } from '../otel-record';
import type { ErrorAttributes, ErrorLevel, ErrorRecord } from './error-reporter.type';

type BuildErrorRecordInput = {
  readonly error?: Error | undefined;
  readonly message?: string | undefined;
  readonly level: ErrorLevel;
  readonly attributes?: ErrorAttributes | undefined;
  readonly fingerprint?: ReadonlyArray<string> | undefined;
  readonly scope?: TelemetryScope | undefined;
  readonly identity?: Identity | undefined;
  readonly trace?: Traced | undefined;
};

const messageAttribute = (message: string | undefined): Readonly<Record<string, unknown>> => (message ? { message } : {});

const fingerprintAttribute = (fingerprint: ReadonlyArray<string> | undefined): Readonly<Record<string, unknown>> =>
  fingerprint ? { fingerprint: [...fingerprint] } : {};

export const buildErrorRecord = ({
  error,
  message,
  level,
  attributes,
  fingerprint,
  scope,
  identity,
  trace
}: BuildErrorRecordInput): ErrorRecord => ({
  severityText: level.toUpperCase(),
  severityNumber: SEVERITY_NUMBER[level],
  ...scope,
  ...identityAttributes(identity),
  ...trace,
  event: error ? 'exception' : 'message',
  ...messageAttribute(message),
  ...attributes,
  ...exceptionAttributes(error),
  ...fingerprintAttribute(fingerprint)
});
