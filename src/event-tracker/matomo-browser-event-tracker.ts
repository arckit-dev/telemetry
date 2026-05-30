import { buildEventRecord } from './build-event-record';
import type { EventProperties, EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from './event-tracker.type';

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export type MatomoBrowserOptions = {
  readonly url: string;
  readonly siteId: string;
  readonly disableCookies?: boolean | undefined;
  readonly enableLinkTracking?: boolean | undefined;
  readonly heartBeatTimer?: boolean | number | undefined;
  readonly respectDoNotTrack?: boolean | undefined;
  readonly scriptUrl?: string | undefined;
};

const DEFAULT_HEART_BEAT_SECONDS = 15;

let initialized = false;

const envelope = () => ({
  timestamp: new Date().toISOString(),
  messageId: crypto.randomUUID()
});

const splitEvent = (eventName: string): { category: string; action: string } => {
  const [category, ...rest] = eventName.split(' ');
  const action = rest.join(' ');
  return { category: category ?? eventName, action: action || eventName };
};

const numericValue = (properties: EventProperties | undefined): number | undefined =>
  typeof properties?.['value'] === 'number' ? properties['value'] : undefined;

const stringName = (properties: EventProperties | undefined): string | undefined =>
  typeof properties?.['name'] === 'string' ? properties['name'] : undefined;

const stringUrl = (properties: EventProperties | undefined): string | undefined =>
  typeof properties?.['url'] === 'string' ? properties['url'] : undefined;

const paqPush = (...args: unknown[]): void => {
  if (typeof window === 'undefined' || !window._paq) return;
  window._paq.push(args);
};

const injectScript = (src: string): void => {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  const first = document.getElementsByTagName('script')[0];
  if (first?.parentNode) first.parentNode.insertBefore(script, first);
  else document.head.appendChild(script);
};

export const initMatomoBrowser = (options: MatomoBrowserOptions): void => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  const paq = window._paq ?? [];
  window._paq = paq;
  if (options.disableCookies) paq.push(['disableCookies']);
  if (options.respectDoNotTrack) paq.push(['setDoNotTrack', true]);
  paq.push(['setTrackerUrl', `${options.url}/matomo.php`]);
  paq.push(['setSiteId', options.siteId]);
  if (options.enableLinkTracking !== false) paq.push(['enableLinkTracking']);
  if (options.heartBeatTimer) {
    paq.push([
      'enableHeartBeatTimer',
      typeof options.heartBeatTimer === 'number' ? options.heartBeatTimer : DEFAULT_HEART_BEAT_SECONDS
    ]);
  }

  injectScript(options.scriptUrl ?? `${options.url}/matomo.js`);
};

export const matomoBrowserEventTracker = (): EventTracker => ({
  track: (event: TrackedEvent): EventRecord => {
    const record = buildEventRecord({ type: 'track', ...event, ...envelope() });
    const { category, action } = splitEvent(event.event);
    if (event.userId) paqPush('setUserId', event.userId);
    paqPush('trackEvent', category, action, stringName(event.properties), numericValue(event.properties));
    return record;
  },
  identify: (event: IdentifyEvent): EventRecord => {
    paqPush('setUserId', event.userId);
    return buildEventRecord({ type: 'identify', ...event, ...envelope() });
  },
  page: (event: PageEvent): EventRecord => {
    const record = buildEventRecord({ type: 'page', ...event, ...envelope() });
    const url = stringUrl(event.properties);
    if (event.userId) paqPush('setUserId', event.userId);
    if (url) paqPush('setCustomUrl', url);
    if (event.name) paqPush('setDocumentTitle', event.name);
    paqPush('trackPageView');
    return record;
  }
});
