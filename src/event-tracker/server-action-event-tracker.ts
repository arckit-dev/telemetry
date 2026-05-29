import { buildEventRecord } from './build-event-record';
import type { EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from './event-tracker.type';

export type TrackAction = (event: TrackedEvent) => Promise<void>;
export type IdentifyAction = (event: IdentifyEvent) => Promise<void>;
export type PageAction = (event: PageEvent) => Promise<void>;

export type ServerActionEventTrackerActions = {
  readonly track: TrackAction;
  readonly identify: IdentifyAction;
  readonly page: PageAction;
};

const envelope = () => ({
  timestamp: new Date().toISOString(),
  messageId: crypto.randomUUID()
});

export const serverActionEventTracker = ({ track, identify, page }: ServerActionEventTrackerActions): EventTracker => ({
  track: (event: TrackedEvent): EventRecord => {
    track(event).catch(() => undefined);
    return buildEventRecord({ type: 'track', ...event, ...envelope() });
  },
  identify: (event: IdentifyEvent): EventRecord => {
    identify(event).catch(() => undefined);
    return buildEventRecord({ type: 'identify', ...event, ...envelope() });
  },
  page: (event: PageEvent): EventRecord => {
    page(event).catch(() => undefined);
    return buildEventRecord({ type: 'page', ...event, ...envelope() });
  }
});
