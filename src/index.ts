export type { ContextGetters, Identity, TelemetryScope, TelemetrySource, Traced } from './context/context.type';

export type {
  CaptureExceptionAction,
  CaptureMessageAction,
  ErrorAttributes,
  ErrorCapture,
  ErrorLevel,
  ErrorRecord,
  ErrorReporter,
  MessageCapture,
  ServerActionReporterActions
} from './error-reporter';
export {
  buildErrorRecord,
  createLoggerReporter,
  createNoopReporter,
  createSentryReporter,
  serverActionReporter
} from './error-reporter';

export type {
  AnonymousId,
  EventName,
  EventProperties,
  EventRecord,
  EventTracker,
  IdentifyAction,
  IdentifyEvent,
  MatomoBrowserOptions,
  MatomoConfig,
  PageAction,
  PageEvent,
  ServerActionEventTrackerActions,
  TrackAction,
  TrackedEvent,
  UserId
} from './event-tracker';
export {
  buildEventRecord,
  createLoggerEventTracker,
  createMatomoEventTracker,
  createNoopEventTracker,
  initMatomoBrowser,
  matomoBrowserEventTracker,
  matomoBrowserPageView,
  serverActionEventTracker
} from './event-tracker';
export type { Instrument } from './instrument';
export { createInstrument } from './instrument';
export type {
  AttributeValue,
  LogAttributes,
  LogClientAction,
  LogEntry,
  Logger,
  LogLevel,
  LogRecord
} from './logger';
export { buildLogRecord, createConsoleLogger, createPinoLogger, noopLogger, serverActionLogger } from './logger';
export type {
  Counter,
  CreateOtelMetricsOptions,
  Gauge,
  Histogram,
  InstrumentOptions,
  Measurement,
  Metrics
} from './metrics';
export { buildMeasurement, createLoggerMetrics, createOtelMetrics, noopMetrics } from './metrics';
export type { Span, SpanAttributes, SpanKind, SpanStatus, StartSpanOptions, Tracer } from './tracer';
export { buildSpanAttributes, createLoggerTracer, noopTracer, otelTracer } from './tracer';
