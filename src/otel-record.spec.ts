import { describe, expect, it } from 'vitest';
import { exceptionAttributes, identityAttributes, SEVERITY_NUMBER } from './otel-record';

describe('SEVERITY_NUMBER', () => {
  it('maps info to the OTel severity number 9', () => {
    expect(SEVERITY_NUMBER.info).toBe(9);
  });

  it('maps fatal to the OTel severity number 21', () => {
    expect(SEVERITY_NUMBER.fatal).toBe(21);
  });
});

describe('identityAttributes', () => {
  it('returns an empty object when no identity is provided', () => {
    expect(identityAttributes(undefined)).toEqual({});
  });

  it('emits only the anonymous id for an anonymous identity', () => {
    expect(identityAttributes({ kind: 'anonymous', anonymousId: 'a1' })).toEqual({ 'enduser.anonymous_id': 'a1' });
  });

  it('emits both the user id and anonymous id for an identified identity', () => {
    expect(identityAttributes({ kind: 'identified', anonymousId: 'a1', userId: 'u1' })).toEqual({
      'enduser.id': 'u1',
      'enduser.anonymous_id': 'a1'
    });
  });
});

describe('exceptionAttributes', () => {
  it('returns an empty object when no error is provided', () => {
    expect(exceptionAttributes(undefined)).toEqual({});
  });

  it('projects the error name under exception.type', () => {
    expect(exceptionAttributes(Object.assign(new Error('boom'), { name: 'PaymentError' }))['exception.type']).toBe(
      'PaymentError'
    );
  });
});
