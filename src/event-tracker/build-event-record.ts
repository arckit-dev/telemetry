import type { Identity, TelemetryScope, Traced } from '../context';
import type { AnonymousId, EventName, EventProperties, EventRecord, UserId } from './event-tracker.type';

type CommonInput = {
  readonly userId?: UserId | undefined;
  readonly anonymousId?: AnonymousId | undefined;
  readonly timestamp: string;
  readonly messageId: string;
  readonly scope?: TelemetryScope | undefined;
  readonly identity?: Identity | undefined;
  readonly trace?: Traced | undefined;
};

type TrackInput = CommonInput & {
  readonly type: 'track';
  readonly event: EventName;
  readonly properties?: EventProperties | undefined;
};

type IdentifyInput = CommonInput & {
  readonly type: 'identify';
  readonly userId: UserId;
  readonly traits?: EventProperties | undefined;
};

type PageInput = CommonInput & {
  readonly type: 'page';
  readonly name?: string | undefined;
  readonly properties?: EventProperties | undefined;
};

type BuildEventRecordInput = TrackInput | IdentifyInput | PageInput;

const LIBRARY = { name: 'arckit-telemetry', version: '0.1.0' } as const;

const identifiedUserId = (identity: Identity | undefined): UserId | undefined =>
  identity?.kind === 'identified' ? identity.userId : undefined;

const resolveUserId = (input: BuildEventRecordInput): UserId | undefined => input.userId ?? identifiedUserId(input.identity);

const resolveAnonymousId = (input: BuildEventRecordInput): AnonymousId | undefined =>
  input.anonymousId ?? input.identity?.anonymousId ?? (input.scope?.source === 'client' ? input.scope.anonymousId : undefined);

const scopeContextFields = (scope: TelemetryScope | undefined): Readonly<Record<string, unknown>> => {
  if (!scope) return {};
  if (scope.source === 'client') return { source: 'client' };
  return { source: scope.source, requestId: scope.requestId };
};

const traceContextFields = (trace: Traced | undefined): Readonly<Record<string, unknown>> =>
  trace ? { traceId: trace.traceId, spanId: trace.spanId } : {};

const buildContext = (input: BuildEventRecordInput): Readonly<Record<string, unknown>> => ({
  library: LIBRARY,
  ...scopeContextFields(input.scope),
  ...traceContextFields(input.trace)
});

const typeSpecificFields = (input: BuildEventRecordInput): Readonly<Record<string, unknown>> => {
  if (input.type === 'track') return { event: input.event, properties: input.properties ?? {} };
  if (input.type === 'identify') return { traits: input.traits ?? {} };
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    properties: input.properties ?? {}
  };
};

export const buildEventRecord = (input: BuildEventRecordInput): EventRecord => {
  const userId = resolveUserId(input);
  const anonymousId = resolveAnonymousId(input);
  return {
    type: input.type,
    timestamp: input.timestamp,
    messageId: input.messageId,
    ...(userId !== undefined ? { userId } : {}),
    ...(anonymousId !== undefined ? { anonymousId } : {}),
    ...typeSpecificFields(input),
    context: buildContext(input)
  };
};
