import type { Identity, TelemetryScope, Traced } from '../context';
import { exceptionAttributes, identityAttributes, SEVERITY_NUMBER } from '../otel-record';
import type { LogEntry, LogRecord } from './logger.type';

type BuildLogRecordInput = LogEntry & {
  readonly scope?: TelemetryScope | undefined;
  readonly identity?: Identity | undefined;
  readonly trace?: Traced | undefined;
};

export const buildLogRecord = ({
  level,
  event,
  attributes,
  error,
  scope,
  identity,
  trace
}: BuildLogRecordInput): LogRecord => ({
  severityText: level.toUpperCase(),
  severityNumber: SEVERITY_NUMBER[level],
  ...scope,
  ...identityAttributes(identity),
  ...trace,
  event,
  ...attributes,
  ...exceptionAttributes(error)
});
