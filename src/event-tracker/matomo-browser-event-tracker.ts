import { buildEventRecord } from './build-event-record';
import type { EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from './event-tracker.type';

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

const envelope = () => ({
  timestamp: new Date().toISOString(),
  messageId: crypto.randomUUID()
});

const splitEvent = (eventName: string): { category: string; action: string } => {
  const [category, ...rest] = eventName.split(' ');
  const action = rest.join(' ');
  return { category: category ?? eventName, action: action || eventName };
};

const paqPush = (...args: unknown[]): void => {
  if (typeof window === 'undefined' || !window._paq) return;
  window._paq.push(args);
};

export const matomoBrowserEventTracker = (): EventTracker => ({
  track: (event: TrackedEvent): EventRecord => {
    const record = buildEventRecord({ type: 'track', ...event, ...envelope() });
    const { category, action } = splitEvent(event.event);
    const numericValue = typeof event.properties?.['value'] === 'number' ? event.properties['value'] : undefined;
    if (event.userId) paqPush('setUserId', event.userId);
    paqPush('trackEvent', category, action, undefined, numericValue);
    return record;
  },
  identify: (event: IdentifyEvent): EventRecord => {
    paqPush('setUserId', event.userId);
    return buildEventRecord({ type: 'identify', ...event, ...envelope() });
  },
  page: (event: PageEvent): EventRecord => {
    const record = buildEventRecord({ type: 'page', ...event, ...envelope() });
    if (event.userId) paqPush('setUserId', event.userId);
    if (event.name) paqPush('setDocumentTitle', event.name);
    paqPush('trackPageView');
    return record;
  }
});
