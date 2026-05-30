import { describe, expect, it } from 'vitest';
import { buildMatomoPageParams, buildMatomoTrackParams, matomoVisitorId } from './build-matomo-params';

const config = { url: 'http://matomo.local', siteId: '1' };

describe('buildMatomoTrackParams', () => {
  it('includes idsite from config', () => {
    expect(buildMatomoTrackParams({ config, event: 'Order Completed' }).get('idsite')).toBe('1');
  });

  it('includes rec=1', () => {
    expect(buildMatomoTrackParams({ config, event: 'Order Completed' }).get('rec')).toBe('1');
  });

  it('splits the event name into category', () => {
    expect(buildMatomoTrackParams({ config, event: 'Order Completed' }).get('e_c')).toBe('Order');
  });

  it('splits the event name into action (everything after the first word)', () => {
    expect(buildMatomoTrackParams({ config, event: 'Order Refund Requested' }).get('e_a')).toBe('Refund Requested');
  });

  it('uses the full event name as action when no whitespace is present', () => {
    expect(buildMatomoTrackParams({ config, event: 'Signup' }).get('e_a')).toBe('Signup');
  });

  it('includes uid when userId is provided', () => {
    expect(buildMatomoTrackParams({ config, event: 'X', userId: 'u1' }).get('uid')).toBe('u1');
  });

  it('omits uid when userId is absent', () => {
    expect(buildMatomoTrackParams({ config, event: 'X' }).has('uid')).toBe(false);
  });

  it('includes _id derived from the anonymousId hash', () => {
    expect(buildMatomoTrackParams({ config, event: 'X', anonymousId: 'a1' }).get('_id')).toBe(matomoVisitorId('a1'));
  });

  it('omits _id when anonymousId is absent', () => {
    expect(buildMatomoTrackParams({ config, event: 'X' }).has('_id')).toBe(false);
  });

  it('includes e_n when properties.name is a string', () => {
    expect(buildMatomoTrackParams({ config, event: 'Search Select', properties: { name: 'commune' } }).get('e_n')).toBe(
      'commune'
    );
  });

  it('omits e_n when properties.name is absent', () => {
    expect(buildMatomoTrackParams({ config, event: 'X' }).has('e_n')).toBe(false);
  });

  it('omits e_n when properties.name is not a string', () => {
    expect(buildMatomoTrackParams({ config, event: 'X', properties: { name: 42 } }).has('e_n')).toBe(false);
  });

  it('excludes the name property from custom dimensions when also mapped', () => {
    expect(
      buildMatomoTrackParams({
        config: { ...config, customDimensions: { name: 4 } },
        event: 'X',
        properties: { name: 'commune' }
      }).has('dimension4')
    ).toBe(false);
  });

  it('includes e_v when properties.value is a number', () => {
    expect(buildMatomoTrackParams({ config, event: 'X', properties: { value: 49.9 } }).get('e_v')).toBe('49.9');
  });

  it('omits e_v when properties.value is not a number', () => {
    expect(buildMatomoTrackParams({ config, event: 'X', properties: { value: 'high' } }).has('e_v')).toBe(false);
  });

  it('includes cdt as the unix timestamp in seconds', () => {
    expect(buildMatomoTrackParams({ config, event: 'X', timestamp: '2026-05-28T10:00:00.000Z' }).get('cdt')).toBe(
      `${Math.floor(Date.UTC(2026, 4, 28, 10, 0, 0) / 1000)}`
    );
  });

  it('maps properties to Matomo custom dimensions according to config', () => {
    const params = buildMatomoTrackParams({
      config: { ...config, customDimensions: { orderId: 1, currency: 2 } },
      event: 'X',
      properties: { orderId: 'o1', currency: 'EUR' }
    });
    expect(params.get('dimension1')).toBe('o1');
  });

  it('omits dimension slots when properties do not match config', () => {
    expect(
      buildMatomoTrackParams({
        config: { ...config, customDimensions: { orderId: 1 } },
        event: 'X',
        properties: { unrelated: 'v' }
      }).has('dimension1')
    ).toBe(false);
  });

  it('excludes the value property from custom dimensions when also mapped', () => {
    expect(
      buildMatomoTrackParams({
        config: { ...config, customDimensions: { value: 3 } },
        event: 'X',
        properties: { value: 49.9 }
      }).has('dimension3')
    ).toBe(false);
  });
});

describe('buildMatomoPageParams', () => {
  it('includes idsite and rec', () => {
    expect(buildMatomoPageParams({ config }).get('idsite')).toBe('1');
  });

  it('includes action_name when name is provided', () => {
    expect(buildMatomoPageParams({ config, name: 'Checkout' }).get('action_name')).toBe('Checkout');
  });

  it('includes url when provided', () => {
    expect(buildMatomoPageParams({ config, url: 'https://ihexa.app/checkout' }).get('url')).toBe('https://ihexa.app/checkout');
  });

  it('omits url when not provided', () => {
    expect(buildMatomoPageParams({ config }).has('url')).toBe(false);
  });

  it('includes urlref when a referrer is provided', () => {
    expect(buildMatomoPageParams({ config, referrer: 'https://ihexa.app/' }).get('urlref')).toBe('https://ihexa.app/');
  });

  it('omits urlref when no referrer is provided', () => {
    expect(buildMatomoPageParams({ config }).has('urlref')).toBe(false);
  });

  it('includes uid when userId is provided', () => {
    expect(buildMatomoPageParams({ config, userId: 'u1' }).get('uid')).toBe('u1');
  });
});

describe('matomoVisitorId', () => {
  it('produces a 16-character lowercase hex string', () => {
    expect(matomoVisitorId('a1')).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic for the same input', () => {
    expect(matomoVisitorId('a1')).toBe(matomoVisitorId('a1'));
  });
});
