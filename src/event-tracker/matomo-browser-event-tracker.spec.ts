import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initMatomoBrowser, matomoBrowserEventTracker, matomoBrowserPageView } from './matomo-browser-event-tracker';

const paq = (): unknown[][] => window._paq ?? [];

const stubBrowser = (href: string, title: string): void => {
  (globalThis as { window?: unknown }).window = { _paq: [], location: { href, origin: new URL(href).origin } };
  (globalThis as { document?: unknown }).document = { title };
};

beforeEach(() => {
  stubBrowser('https://app.test/start', 'Accueil');
});

afterEach(() => {
  (globalThis as { window?: unknown }).window = undefined;
  (globalThis as { document?: unknown }).document = undefined;
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

  it('sets the referrer url from properties.referrer', () => {
    matomoBrowserEventTracker().page({ properties: { url: '/b', referrer: '/a' } });
    expect(paq()).toContainEqual(['setReferrerUrl', '/a']);
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

describe('initMatomoBrowser', () => {
  it('does nothing when the url is missing (no _paq writes)', () => {
    initMatomoBrowser({ siteId: '1', disableCookies: true });
    expect(paq()).toHaveLength(0);
  });

  it('does nothing when the siteId is missing (no _paq writes)', () => {
    initMatomoBrowser({ url: 'https://matomo.test', disableCookies: true });
    expect(paq()).toHaveLength(0);
  });
});

describe('matomoBrowserPageView', () => {
  it('tracks the current location when called without an href', () => {
    matomoBrowserPageView()();
    expect(paq()).toContainEqual(['setCustomUrl', '/start']);
    expect(paq()).toContainEqual(['setDocumentTitle', 'Accueil']);
    expect(paq()).toContainEqual(['trackPageView']);
  });

  it('normalises an absolute href to a path + search', () => {
    matomoBrowserPageView()('https://app.test/foo?x=1');
    expect(paq()).toContainEqual(['setCustomUrl', '/foo?x=1']);
  });

  it('chains the previous url as the referrer on subsequent views', () => {
    const trackPageView = matomoBrowserPageView();
    trackPageView('/a');
    trackPageView('/b');
    expect(paq()).toContainEqual(['setReferrerUrl', '/a']);
    expect(paq()).toContainEqual(['setCustomUrl', '/b']);
  });

  it('does not set a referrer on the very first view', () => {
    matomoBrowserPageView()('/a');
    expect(paq().some(([command]) => command === 'setReferrerUrl')).toBe(false);
  });

  it('deduplicates consecutive views of the same url', () => {
    const trackPageView = matomoBrowserPageView();
    trackPageView('/same');
    window._paq = [];
    trackPageView('/same');
    expect(paq()).toHaveLength(0);
  });
});
