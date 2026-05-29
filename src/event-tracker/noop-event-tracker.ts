import type { ContextGetters } from '../context';
import { buildEventRecord } from './build-event-record';
import type { EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from './event-tracker.type';

export const createNoopEventTracker = ({ getScope, getIdentity, getTrace }: ContextGetters = {}): EventTracker => {
  const envelope = () => ({
    timestamp: new Date().toISOString(),
    messageId: crypto.randomUUID(),
    scope: getScope?.(),
    identity: getIdentity?.(),
    trace: getTrace?.()
  });

  return {
    track: (event: TrackedEvent): EventRecord => buildEventRecord({ type: 'track', ...event, ...envelope() }),
    identify: (event: IdentifyEvent): EventRecord => buildEventRecord({ type: 'identify', ...event, ...envelope() }),
    page: (event: PageEvent): EventRecord => buildEventRecord({ type: 'page', ...event, ...envelope() })
  };
};
