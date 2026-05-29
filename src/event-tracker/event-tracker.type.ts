import type { AttributeValue } from '../logger';

export type EventName = string;
export type UserId = string;
export type AnonymousId = string;

export type EventProperties = Readonly<Record<string, AttributeValue>>;

export type TrackedEvent = {
  readonly event: EventName;
  readonly userId?: UserId | undefined;
  readonly anonymousId?: AnonymousId | undefined;
  readonly properties?: EventProperties | undefined;
};

export type IdentifyEvent = {
  readonly userId: UserId;
  readonly anonymousId?: AnonymousId | undefined;
  readonly traits?: EventProperties | undefined;
};

export type PageEvent = {
  readonly name?: string | undefined;
  readonly userId?: UserId | undefined;
  readonly anonymousId?: AnonymousId | undefined;
  readonly properties?: EventProperties | undefined;
};

export type EventRecord = Readonly<Record<string, unknown>>;

export type EventTracker = {
  readonly track: (event: TrackedEvent) => EventRecord;
  readonly identify: (event: IdentifyEvent) => EventRecord;
  readonly page: (event: PageEvent) => EventRecord;
};
