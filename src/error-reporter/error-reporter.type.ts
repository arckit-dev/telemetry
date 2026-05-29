import type { AttributeValue } from '../logger';

export type ErrorLevel = 'warn' | 'error' | 'fatal';

export type ErrorAttributes = Readonly<Record<string, AttributeValue>>;

export type ErrorCapture = {
  readonly error: Error;
  readonly level?: ErrorLevel | undefined;
  readonly attributes?: ErrorAttributes | undefined;
  readonly fingerprint?: ReadonlyArray<string> | undefined;
};

export type MessageCapture = {
  readonly message: string;
  readonly level: ErrorLevel;
  readonly attributes?: ErrorAttributes | undefined;
  readonly fingerprint?: ReadonlyArray<string> | undefined;
};

export type ErrorRecord = Readonly<Record<string, unknown>>;

export type ErrorReporter = {
  readonly captureException: (capture: ErrorCapture) => ErrorRecord;
  readonly captureMessage: (capture: MessageCapture) => ErrorRecord;
};
