import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { matomoBrowserEventTracker } from './matomo-browser-event-tracker';

const paq = (): unknown[][] => window._paq ?? [];

beforeEach(() => {
  (globalThis as { window?: Window }).window = { _paq: [] } as unknown as Window;
});

afterEach(() => {
  (globalThis as { window?: Window }).window = undefined;
});

describe('matomoBrowserEventTracker track', () => {
  it('splits the event name into category and action then pushes trackEvent', () => {
    matomoBrowserEventTracker().track({ event: 'Search search_select' });
    expect(paq()).toContainEqual(['trackEvent', 'Search', 'search_select', undefined, undefined]);
  });

  it('forwards properties.name as the Matomo event name (3rd arg)', () => {
    matomoBrowserEventTracker().track({ event: 'Navigation region_select', properties: { name: 'Bretagne' } });
    expect(paq()).toContainEqual(['trackEvent', 'Navigation', 'region_select', 'Bretagne', undefined]);
  });

  it('forwards a numeric properties.value as the Matomo event value (4th arg)', () => {
    matomoBrowserEventTracker().track({ event: 'Export export_start', properties: { value: 42 } });
    expect(paq()).toContainEqual(['trackEvent', 'Export', 'export_start', undefined, 42]);
  });

  it('forwards both name and value when present', () => {
    matomoBrowserEventTracker().track({ event: 'Export export_start', properties: { name: 'csv', value: 42 } });
    expect(paq()).toContainEqual(['trackEvent', 'Export', 'export_start', 'csv', 42]);
  });

  it('sets the user id before tracking when userId is provided', () => {
    matomoBrowserEventTracker().track({ event: 'Search search_select', userId: 'u1' });
    expect(paq()).toContainEqual(['setUserId', 'u1']);
  });
});

describe('matomoBrowserEventTracker page', () => {
  it('sets the custom url from properties.url before tracking the page view', () => {
    matomoBrowserEventTracker().page({ properties: { url: '/bretagne/finistere/lieux' } });
    expect(paq()).toContainEqual(['setCustomUrl', '/bretagne/finistere/lieux']);
    expect(paq()).toContainEqual(['trackPageView']);
  });

  it('sets the document title from name when provided', () => {
    matomoBrowserEventTracker().page({ name: 'Lieux — Finistère' });
    expect(paq()).toContainEqual(['setDocumentTitle', 'Lieux — Finistère']);
  });

  it('tracks a page view even without url or name', () => {
    matomoBrowserEventTracker().page({});
    expect(paq()).toContainEqual(['trackPageView']);
  });
});
