import { describe, expect, it } from 'vitest';
import type { Identity, TelemetryScope, Traced } from './context.type';
import {
  enterIdentity,
  enterScope,
  enterTrace,
  getIdentity,
  getScope,
  getTrace,
  runWithIdentity,
  runWithScope,
  runWithTrace
} from './telemetry-context';

const inFreshContext = <T>(fn: () => T | Promise<T>): Promise<T> => new Promise((resolve) => setImmediate(() => resolve(fn())));

describe('scope store', () => {
  it('returns undefined when called outside any scope', () => {
    expect(getScope()).toBeUndefined();
  });

  it('exposes the active server scope inside runWithScope', () => {
    const observed = runWithScope({ source: 'server', requestId: 'r1' }, () => getScope());
    expect(observed).toEqual({ source: 'server', requestId: 'r1' });
  });

  it('exposes the active edge scope inside runWithScope', () => {
    const observed = runWithScope({ source: 'edge', requestId: 'r1' }, () => getScope());
    expect(observed).toEqual({ source: 'edge', requestId: 'r1' });
  });

  it('exposes the active client scope inside runWithScope', () => {
    const observed = runWithScope({ source: 'client', anonymousId: 'a1' }, () => getScope());
    expect(observed).toEqual({ source: 'client', anonymousId: 'a1' });
  });

  it('returns undefined again once the scope exits', () => {
    runWithScope({ source: 'server', requestId: 'r1' }, () => undefined);
    expect(getScope()).toBeUndefined();
  });

  it('isolates concurrent scopes', async () => {
    const [a, b] = await Promise.all([
      runWithScope({ source: 'server', requestId: 'rA' }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return getScope();
      }),
      runWithScope({ source: 'server', requestId: 'rB' }, async () => getScope())
    ]);
    expect([a, b]).toEqual([
      { source: 'server', requestId: 'rA' },
      { source: 'server', requestId: 'rB' }
    ]);
  });
});

describe('identity store', () => {
  it('returns undefined when called outside runWithIdentity', () => {
    expect(getIdentity()).toBeUndefined();
  });

  it('exposes the active anonymous identity inside runWithIdentity', () => {
    const observed = runWithIdentity({ kind: 'anonymous', anonymousId: 'a1' }, () => getIdentity());
    expect(observed).toEqual({ kind: 'anonymous', anonymousId: 'a1' });
  });

  it('exposes the active identified identity inside runWithIdentity', () => {
    const observed = runWithIdentity({ kind: 'identified', anonymousId: 'a1', userId: 'u1' }, () => getIdentity());
    expect(observed).toEqual({ kind: 'identified', anonymousId: 'a1', userId: 'u1' });
  });

  it('does not affect the scope store', () => {
    const observed = runWithIdentity({ kind: 'anonymous', anonymousId: 'a1' }, () => getScope());
    expect(observed).toBeUndefined();
  });

  it('returns undefined again once runWithIdentity exits', () => {
    runWithIdentity({ kind: 'anonymous', anonymousId: 'a1' }, () => undefined);
    expect(getIdentity()).toBeUndefined();
  });
});

describe('trace store', () => {
  it('returns undefined when called outside runWithTrace', () => {
    expect(getTrace()).toBeUndefined();
  });

  it('exposes the active trace inside runWithTrace', () => {
    const observed = runWithTrace({ traceId: 't1', spanId: 's1' }, () => getTrace());
    expect(observed).toEqual({ traceId: 't1', spanId: 's1' });
  });

  it('does not affect the scope store', () => {
    const observed = runWithTrace({ traceId: 't1', spanId: 's1' }, () => getScope());
    expect(observed).toBeUndefined();
  });

  it('does not affect the identity store', () => {
    const observed = runWithTrace({ traceId: 't1', spanId: 's1' }, () => getIdentity());
    expect(observed).toBeUndefined();
  });
});

describe('enterScope', () => {
  it('makes the scope visible to getScope from within the fresh async context', async () => {
    const observed = await inFreshContext<TelemetryScope | undefined>(() => {
      enterScope({ source: 'server', requestId: 'r1' });
      return getScope();
    });
    expect(observed).toEqual({ source: 'server', requestId: 'r1' });
  });
});

describe('enterIdentity', () => {
  it('makes the identity visible to getIdentity from within the fresh async context', async () => {
    const observed = await inFreshContext<Identity | undefined>(() => {
      enterIdentity({ kind: 'anonymous', anonymousId: 'a1' });
      return getIdentity();
    });
    expect(observed).toEqual({ kind: 'anonymous', anonymousId: 'a1' });
  });
});

describe('enterTrace', () => {
  it('makes the trace visible to getTrace from within the fresh async context', async () => {
    const observed = await inFreshContext<Traced | undefined>(() => {
      enterTrace({ traceId: 't1', spanId: 's1' });
      return getTrace();
    });
    expect(observed).toEqual({ traceId: 't1', spanId: 's1' });
  });
});

describe('nested stores', () => {
  it('exposes all three stores when fully nested', () => {
    const observed = runWithScope({ source: 'server', requestId: 'r1' }, () =>
      runWithIdentity({ kind: 'identified', anonymousId: 'a1', userId: 'u1' }, () =>
        runWithTrace({ traceId: 't1', spanId: 's1' }, () => ({
          scope: getScope(),
          identity: getIdentity(),
          trace: getTrace()
        }))
      )
    );
    expect(observed).toEqual({
      scope: { source: 'server', requestId: 'r1' },
      identity: { kind: 'identified', anonymousId: 'a1', userId: 'u1' },
      trace: { traceId: 't1', spanId: 's1' }
    });
  });
});
