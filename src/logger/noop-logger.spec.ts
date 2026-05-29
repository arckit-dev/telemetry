import { describe, expect, it } from 'vitest';
import { noopLogger } from './noop-logger';

describe('noopLogger', () => {
  it('returns a LogRecord matching the entry event', () => {
    expect(noopLogger().log({ level: 'info', event: 'x' }).event).toBe('x');
  });

  it('returns a LogRecord matching the entry severity', () => {
    expect(noopLogger().log({ level: 'warn', event: 'x' }).severityText).toBe('WARN');
  });
});
