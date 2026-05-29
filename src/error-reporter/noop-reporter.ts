import type { ContextGetters } from '../context';
import { buildErrorRecord } from './build-error-record';
import type { ErrorCapture, ErrorRecord, ErrorReporter, MessageCapture } from './error-reporter.type';

export const createNoopReporter = ({ getScope, getIdentity, getTrace }: ContextGetters = {}): ErrorReporter => ({
  captureException: (capture: ErrorCapture): ErrorRecord =>
    buildErrorRecord({
      ...capture,
      level: capture.level ?? 'error',
      scope: getScope?.(),
      identity: getIdentity?.(),
      trace: getTrace?.()
    }),
  captureMessage: (capture: MessageCapture): ErrorRecord =>
    buildErrorRecord({ ...capture, scope: getScope?.(), identity: getIdentity?.(), trace: getTrace?.() })
});
