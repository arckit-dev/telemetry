import { buildErrorRecord } from './build-error-record';
import type { ErrorCapture, ErrorRecord, ErrorReporter, MessageCapture } from './error-reporter.type';

export type CaptureExceptionAction = (capture: ErrorCapture) => Promise<void>;
export type CaptureMessageAction = (capture: MessageCapture) => Promise<void>;

export type ServerActionReporterActions = {
  readonly captureException: CaptureExceptionAction;
  readonly captureMessage: CaptureMessageAction;
};

export const serverActionReporter = ({ captureException, captureMessage }: ServerActionReporterActions): ErrorReporter => ({
  captureException: (capture: ErrorCapture): ErrorRecord => {
    captureException(capture).catch(() => undefined);
    return buildErrorRecord({ ...capture, level: capture.level ?? 'error' });
  },
  captureMessage: (capture: MessageCapture): ErrorRecord => {
    captureMessage(capture).catch(() => undefined);
    return buildErrorRecord({ ...capture });
  }
});
