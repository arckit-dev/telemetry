import type { Identity } from './context/context.type';
import type { LogLevel } from './logger/logger.type';

export const SEVERITY_NUMBER: Readonly<Record<LogLevel, number>> = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21
};

export const identityAttributes = (identity: Identity | undefined): Readonly<Record<string, string>> => {
  if (!identity) return {};
  if (identity.kind === 'identified') return { 'enduser.id': identity.userId, 'enduser.anonymous_id': identity.anonymousId };
  return { 'enduser.anonymous_id': identity.anonymousId };
};

export const exceptionAttributes = (error: Error | undefined): Readonly<Record<string, unknown>> =>
  error
    ? {
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack
      }
    : {};
