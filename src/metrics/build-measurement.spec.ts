import { describe, expect, it } from 'vitest';
import { buildMeasurement } from './build-measurement';

describe('buildMeasurement', () => {
  it('returns the instrument name', () => {
    expect(buildMeasurement({ instrumentName: 'orders.created', value: 1, namespace: 'app' }).instrumentName).toBe(
      'orders.created'
    );
  });

  it('returns the value', () => {
    expect(buildMeasurement({ instrumentName: 'x', value: 42, namespace: 'app' }).value).toBe(42);
  });

  it('inlines the per-measurement attributes', () => {
    expect(
      buildMeasurement({
        instrumentName: 'x',
        value: 1,
        namespace: 'app',
        attributes: { paymentMethod: 'card' }
      }).attributes['paymentMethod']
    ).toBe('card');
  });

  it('merges the scope identity under the namespaced keys', () => {
    expect(
      buildMeasurement({
        instrumentName: 'x',
        value: 1,
        namespace: 'app',
        scope: { source: 'server', requestId: 'r1' }
      }).attributes['app.source']
    ).toBe('server');
  });

  it('merges the identified userId under enduser.id', () => {
    expect(
      buildMeasurement({
        instrumentName: 'x',
        value: 1,
        namespace: 'app',
        identity: { kind: 'identified', anonymousId: 'a1', userId: 'u1' }
      }).attributes['enduser.id']
    ).toBe('u1');
  });
});
