import { describe, expect, it } from 'vitest';
import { buildErrorRecord } from './build-error-record';

describe('buildErrorRecord', () => {
  it('places error.name under exception.type', () => {
    const error = Object.assign(new Error('boom'), { name: 'PaymentError' });
    expect(buildErrorRecord({ error, level: 'error' })['exception.type']).toBe('PaymentError');
  });

  it('places error.message under exception.message', () => {
    expect(buildErrorRecord({ error: new Error('boom'), level: 'error' })['exception.message']).toBe('boom');
  });

  it('places error.stack under exception.stacktrace', () => {
    const error = new Error('boom');
    expect(buildErrorRecord({ error, level: 'error' })['exception.stacktrace']).toBe(error.stack);
  });

  it('uses the exception event name when an error is captured', () => {
    expect(buildErrorRecord({ error: new Error('boom'), level: 'error' }).event).toBe('exception');
  });

  it('uses the message event name when a message is captured', () => {
    expect(buildErrorRecord({ message: 'budget low', level: 'warn' }).event).toBe('message');
  });

  it('places the message text under the message field', () => {
    expect(buildErrorRecord({ message: 'budget low', level: 'warn' }).message).toBe('budget low');
  });

  it('emits severityNumber 13 for warn', () => {
    expect(buildErrorRecord({ error: new Error('x'), level: 'warn' }).severityNumber).toBe(13);
  });

  it('emits severityNumber 17 for error', () => {
    expect(buildErrorRecord({ error: new Error('x'), level: 'error' }).severityNumber).toBe(17);
  });

  it('emits severityNumber 21 for fatal', () => {
    expect(buildErrorRecord({ error: new Error('x'), level: 'fatal' }).severityNumber).toBe(21);
  });

  it('emits the matching severityText', () => {
    expect(buildErrorRecord({ error: new Error('x'), level: 'fatal' }).severityText).toBe('FATAL');
  });

  it('inlines extra attributes as record fields', () => {
    expect(
      buildErrorRecord({
        error: new Error('x'),
        level: 'error',
        attributes: { paymentId: 'p1', businessName: 'Acme' }
      })
    ).toMatchObject({ paymentId: 'p1', businessName: 'Acme' });
  });

  it('exposes fingerprint as an array field when provided', () => {
    expect(
      buildErrorRecord({ error: new Error('x'), level: 'error', fingerprint: ['payment', 'declined'] }).fingerprint
    ).toEqual(['payment', 'declined']);
  });

  it('omits fingerprint when not provided', () => {
    expect(Object.keys(buildErrorRecord({ error: new Error('x'), level: 'error' }))).not.toContain('fingerprint');
  });

  it('merges scope identity into the record', () => {
    expect(
      buildErrorRecord({
        error: new Error('x'),
        level: 'error',
        scope: { source: 'server', requestId: 'r1' }
      })
    ).toMatchObject({ source: 'server', requestId: 'r1' });
  });

  it('emits the anonymous identity under enduser.anonymous_id', () => {
    expect(
      buildErrorRecord({
        error: new Error('x'),
        level: 'error',
        identity: { kind: 'anonymous', anonymousId: 'a1' }
      })['enduser.anonymous_id']
    ).toBe('a1');
  });

  it('emits the identified identity under enduser.id', () => {
    expect(
      buildErrorRecord({
        error: new Error('x'),
        level: 'error',
        identity: { kind: 'identified', anonymousId: 'a1', userId: 'u1' }
      })['enduser.id']
    ).toBe('u1');
  });

  it('omits the kind discriminant from the record', () => {
    expect(
      Object.keys(
        buildErrorRecord({
          error: new Error('x'),
          level: 'error',
          identity: { kind: 'anonymous', anonymousId: 'a1' }
        })
      )
    ).not.toContain('kind');
  });

  it('merges trace identity into the record', () => {
    expect(
      buildErrorRecord({
        error: new Error('x'),
        level: 'error',
        trace: { traceId: 't1', spanId: 's1' }
      })
    ).toMatchObject({ traceId: 't1', spanId: 's1' });
  });
});
