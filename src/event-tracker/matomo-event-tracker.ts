import type { ContextGetters } from '../context';
import { buildEventRecord } from './build-event-record';
import { buildMatomoPageParams, buildMatomoTrackParams, type MatomoConfig } from './build-matomo-params';
import type { EventRecord, EventTracker, IdentifyEvent, PageEvent, TrackedEvent } from './event-tracker.type';

type CreateMatomoEventTrackerOptions = {
  readonly config: MatomoConfig;
} & ContextGetters;

const matomoFetch = (config: MatomoConfig, params: URLSearchParams): void => {
  fetch(`${config.url}/matomo.php?${params.toString()}`).catch(() => undefined);
};

export const createMatomoEventTracker = ({ config, ...getters }: CreateMatomoEventTrackerOptions): EventTracker => {
  const envelope = () => ({
    timestamp: new Date().toISOString(),
    messageId: crypto.randomUUID(),
    scope: getters.getScope?.(),
    identity: getters.getIdentity?.(),
    trace: getters.getTrace?.()
  });

  return {
    track: (event: TrackedEvent): EventRecord => {
      const record = buildEventRecord({ type: 'track', ...event, ...envelope() });
      matomoFetch(
        config,
        buildMatomoTrackParams({
          config,
          event: event.event,
          userId: record['userId'] as string | undefined,
          anonymousId: record['anonymousId'] as string | undefined,
          timestamp: record['timestamp'] as string,
          properties: event.properties
        })
      );
      return record;
    },
    identify: (event: IdentifyEvent): EventRecord => buildEventRecord({ type: 'identify', ...event, ...envelope() }),
    page: (event: PageEvent): EventRecord => {
      const record = buildEventRecord({ type: 'page', ...event, ...envelope() });
      matomoFetch(
        config,
        buildMatomoPageParams({
          config,
          name: event.name,
          url: event.properties?.['url'] as string | undefined,
          referrer: event.properties?.['referrer'] as string | undefined,
          userId: record['userId'] as string | undefined,
          anonymousId: record['anonymousId'] as string | undefined,
          timestamp: record['timestamp'] as string
        })
      );
      return record;
    }
  };
};
