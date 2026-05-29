import { describe, expect, it } from 'vitest';
import { buildEventRecord } from './build-event-record';

const fixedTimestamp = '2026-05-28T10:00:00.000Z';
const fixedMessageId = 'msg-1';

describe('buildEventRecord track', () => {
  it('places the type as track', () => {
    expect(buildEventRecord({ type: 'track', event: 'X', timestamp: fixedTimestamp, messageId: fixedMessageId }).type).toBe(
      'track'
    );
  });

  it('places the event name under event', () => {
    expect(
      buildEventRecord({ type: 'track', event: 'Order Completed', timestamp: fixedTimestamp, messageId: fixedMessageId }).event
    ).toBe('Order Completed');
  });

  it('includes the timestamp', () => {
    expect(
      buildEventRecord({ type: 'track', event: 'X', timestamp: fixedTimestamp, messageId: fixedMessageId }).timestamp
    ).toBe(fixedTimestamp);
  });

  it('includes the messageId', () => {
    expect(
      buildEventRecord({ type: 'track', event: 'X', timestamp: fixedTimestamp, messageId: fixedMessageId }).messageId
    ).toBe(fixedMessageId);
  });

  it('defaults properties to an empty object when none provided', () => {
    expect(
      buildEventRecord({ type: 'track', event: 'X', timestamp: fixedTimestamp, messageId: fixedMessageId }).properties
    ).toEqual({});
  });

  it('includes the provided properties', () => {
    expect(
      buildEventRecord({
        type: 'track',
        event: 'X',
        properties: { orderId: 'o1', revenue: 49.9 },
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).properties
    ).toEqual({ orderId: 'o1', revenue: 49.9 });
  });

  it('places the userId at top-level when provided in input', () => {
    expect(
      buildEventRecord({
        type: 'track',
        event: 'X',
        userId: 'u1',
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).userId
    ).toBe('u1');
  });

  it('falls back to identified identity userId when input userId is absent', () => {
    expect(
      buildEventRecord({
        type: 'track',
        event: 'X',
        identity: { kind: 'identified', anonymousId: 'a1', userId: 'u-store' },
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).userId
    ).toBe('u-store');
  });

  it('uses identity anonymousId when input anonymousId is absent', () => {
    expect(
      buildEventRecord({
        type: 'track',
        event: 'X',
        identity: { kind: 'anonymous', anonymousId: 'a-store' },
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).anonymousId
    ).toBe('a-store');
  });

  it('places the anonymousId at top-level when provided in input', () => {
    expect(
      buildEventRecord({
        type: 'track',
        event: 'X',
        anonymousId: 'a1',
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).anonymousId
    ).toBe('a1');
  });

  it('falls back to client scope anonymousId when input is absent', () => {
    expect(
      buildEventRecord({
        type: 'track',
        event: 'X',
        scope: { source: 'client', anonymousId: 'a-scope' },
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).anonymousId
    ).toBe('a-scope');
  });

  it('omits anonymousId for server scope', () => {
    expect(
      Object.keys(
        buildEventRecord({
          type: 'track',
          event: 'X',
          scope: { source: 'server', requestId: 'r1' },
          timestamp: fixedTimestamp,
          messageId: fixedMessageId
        })
      )
    ).not.toContain('anonymousId');
  });
});

describe('buildEventRecord identify', () => {
  it('places the type as identify', () => {
    expect(
      buildEventRecord({ type: 'identify', userId: 'u1', timestamp: fixedTimestamp, messageId: fixedMessageId }).type
    ).toBe('identify');
  });

  it('includes the userId', () => {
    expect(
      buildEventRecord({ type: 'identify', userId: 'u1', timestamp: fixedTimestamp, messageId: fixedMessageId }).userId
    ).toBe('u1');
  });

  it('defaults traits to an empty object when none provided', () => {
    expect(
      buildEventRecord({ type: 'identify', userId: 'u1', timestamp: fixedTimestamp, messageId: fixedMessageId }).traits
    ).toEqual({});
  });

  it('includes the provided traits', () => {
    expect(
      buildEventRecord({
        type: 'identify',
        userId: 'u1',
        traits: { plan: 'premium' },
        timestamp: fixedTimestamp,
        messageId: fixedMessageId
      }).traits
    ).toEqual({ plan: 'premium' });
  });
});

describe('buildEventRecord page', () => {
  it('places the type as page', () => {
    expect(buildEventRecord({ type: 'page', timestamp: fixedTimestamp, messageId: fixedMessageId }).type).toBe('page');
  });

  it('includes the name when provided', () => {
    expect(
      buildEventRecord({ type: 'page', name: 'Checkout', timestamp: fixedTimestamp, messageId: fixedMessageId }).name
    ).toBe('Checkout');
  });

  it('omits the name when not provided', () => {
    expect(Object.keys(buildEventRecord({ type: 'page', timestamp: fixedTimestamp, messageId: fixedMessageId }))).not.toContain(
      'name'
    );
  });
});

describe('buildEventRecord context', () => {
  it('includes the library metadata', () => {
    expect(
      (
        buildEventRecord({ type: 'track', event: 'X', timestamp: fixedTimestamp, messageId: fixedMessageId })
          .context as Readonly<Record<string, unknown>>
      )['library']
    ).toEqual({ name: 'arckit-telemetry', version: '0.1.0' });
  });

  it('includes the scope source in context', () => {
    expect(
      (
        buildEventRecord({
          type: 'track',
          event: 'X',
          scope: { source: 'server', requestId: 'r1' },
          timestamp: fixedTimestamp,
          messageId: fixedMessageId
        }).context as Readonly<Record<string, unknown>>
      )['source']
    ).toBe('server');
  });

  it('includes the scope requestId in context for server scope', () => {
    expect(
      (
        buildEventRecord({
          type: 'track',
          event: 'X',
          scope: { source: 'server', requestId: 'r1' },
          timestamp: fixedTimestamp,
          messageId: fixedMessageId
        }).context as Readonly<Record<string, unknown>>
      )['requestId']
    ).toBe('r1');
  });

  it('includes the trace fields in context when active', () => {
    expect(
      (
        buildEventRecord({
          type: 'track',
          event: 'X',
          trace: { traceId: 't1', spanId: 's1' },
          timestamp: fixedTimestamp,
          messageId: fixedMessageId
        }).context as Readonly<Record<string, unknown>>
      )['traceId']
    ).toBe('t1');
  });
});
