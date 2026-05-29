import { describe, expect, it } from 'vitest';
import { buildLogRecord } from './build-log-record';

describe('buildLogRecord', () => {
  it('places the event under the event key', () => {
    expect(buildLogRecord({ level: 'info', event: 'user.created' }).event).toBe('user.created');
  });

  it('emits the matching OTel severityText for info', () => {
    expect(buildLogRecord({ level: 'info', event: 'x' }).severityText).toBe('INFO');
  });

  it('emits the matching OTel severityNumber for info', () => {
    expect(buildLogRecord({ level: 'info', event: 'x' }).severityNumber).toBe(9);
  });

  it('emits severityNumber 1 for the trace level', () => {
    expect(buildLogRecord({ level: 'trace', event: 'x' }).severityNumber).toBe(1);
  });

  it('emits severityNumber 5 for the debug level', () => {
    expect(buildLogRecord({ level: 'debug', event: 'x' }).severityNumber).toBe(5);
  });

  it('emits severityNumber 13 for the warn level', () => {
    expect(buildLogRecord({ level: 'warn', event: 'x' }).severityNumber).toBe(13);
  });

  it('emits severityNumber 17 for the error level', () => {
    expect(buildLogRecord({ level: 'error', event: 'x' }).severityNumber).toBe(17);
  });

  it('emits severityNumber 21 for the fatal level', () => {
    expect(buildLogRecord({ level: 'fatal', event: 'x' }).severityNumber).toBe(21);
  });

  it('inlines entry attributes as record fields', () => {
    expect(buildLogRecord({ level: 'info', event: 'x', attributes: { userId: 'u1', businessName: 'Acme' } })).toMatchObject({
      userId: 'u1',
      businessName: 'Acme'
    });
  });

  it('merges the scope identity fields into the record', () => {
    expect(buildLogRecord({ level: 'info', event: 'x', scope: { source: 'server', requestId: 'r1' } })).toMatchObject({
      source: 'server',
      requestId: 'r1'
    });
  });

  it('emits the anonymous identity under enduser.anonymous_id', () => {
    expect(
      buildLogRecord({ level: 'info', event: 'x', identity: { kind: 'anonymous', anonymousId: 'a1' } })['enduser.anonymous_id']
    ).toBe('a1');
  });

  it('emits the identified identity under enduser.id', () => {
    expect(
      buildLogRecord({ level: 'info', event: 'x', identity: { kind: 'identified', anonymousId: 'a1', userId: 'u1' } })[
        'enduser.id'
      ]
    ).toBe('u1');
  });

  it('emits the identified anonymous id alongside enduser.id', () => {
    expect(
      buildLogRecord({ level: 'info', event: 'x', identity: { kind: 'identified', anonymousId: 'a1', userId: 'u1' } })[
        'enduser.anonymous_id'
      ]
    ).toBe('a1');
  });

  it('omits the kind discriminant from the record', () => {
    expect(
      Object.keys(buildLogRecord({ level: 'info', event: 'x', identity: { kind: 'anonymous', anonymousId: 'a1' } }))
    ).not.toContain('kind');
  });

  it('merges the trace fields into the record', () => {
    expect(buildLogRecord({ level: 'info', event: 'x', trace: { traceId: 't1', spanId: 's1' } })).toMatchObject({
      traceId: 't1',
      spanId: 's1'
    });
  });

  it('attaches exception.type when an error is provided', () => {
    expect(
      buildLogRecord({
        level: 'error',
        event: 'payment.failed',
        error: Object.assign(new Error('Card declined'), { name: 'PaymentError' })
      })['exception.type']
    ).toBe('PaymentError');
  });

  it('attaches exception.message when an error is provided', () => {
    expect(
      buildLogRecord({ level: 'error', event: 'payment.failed', error: new Error('Card declined') })['exception.message']
    ).toBe('Card declined');
  });

  it('attaches exception.stacktrace when an error is provided', () => {
    const error = new Error('boom');
    expect(buildLogRecord({ level: 'error', event: 'x', error })['exception.stacktrace']).toBe(error.stack);
  });

  it('omits exception.* fields when no error is provided', () => {
    expect(Object.keys(buildLogRecord({ level: 'info', event: 'x' }))).not.toContain('exception.type');
  });
});
