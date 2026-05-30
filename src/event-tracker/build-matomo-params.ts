import type { AttributeValue } from '../logger';
import type { AnonymousId, EventName, EventProperties, UserId } from './event-tracker.type';

export type MatomoConfig = {
  readonly url: string;
  readonly siteId: string;
  readonly customDimensions?: Readonly<Record<string, number>> | undefined;
};

type TrackParamsInput = {
  readonly config: MatomoConfig;
  readonly event: EventName;
  readonly userId?: UserId | undefined;
  readonly anonymousId?: AnonymousId | undefined;
  readonly timestamp?: string | undefined;
  readonly properties?: EventProperties | undefined;
};

type PageParamsInput = {
  readonly config: MatomoConfig;
  readonly name?: string | undefined;
  readonly url?: string | undefined;
  readonly referrer?: string | undefined;
  readonly userId?: UserId | undefined;
  readonly anonymousId?: AnonymousId | undefined;
  readonly timestamp?: string | undefined;
};

const splitEvent = (eventName: EventName): { category: string; action: string } => {
  const [category, ...rest] = eventName.split(' ');
  const action = rest.join(' ');
  return { category: category ?? eventName, action: action || eventName };
};

const stringifyAttribute = (value: AttributeValue): string => (Array.isArray(value) ? JSON.stringify(value) : String(value));

const customDimensionParams = (
  properties: EventProperties | undefined,
  mapping: Readonly<Record<string, number>> | undefined
): Readonly<Record<string, string>> => {
  if (!properties || !mapping) return {};
  return Object.fromEntries(
    Object.entries(mapping)
      .filter(([key]) => key !== 'value' && key !== 'name' && properties[key] !== undefined)
      .map(([key, slot]) => [`dimension${slot}`, stringifyAttribute(properties[key] as AttributeValue)])
  );
};

const unixSeconds = (timestamp: string | undefined): string | undefined =>
  timestamp ? `${Math.floor(new Date(timestamp).getTime() / 1000)}` : undefined;

const numericValue = (properties: EventProperties | undefined): string | undefined => {
  const value = properties?.['value'];
  return typeof value === 'number' ? String(value) : undefined;
};

const stringName = (properties: EventProperties | undefined): string | undefined => {
  const name = properties?.['name'];
  return typeof name === 'string' ? name : undefined;
};

const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK_64 = 0xffffffffffffffffn;

export const matomoVisitorId = (anonymousId: AnonymousId): string => {
  const hash = Array.from(anonymousId).reduce(
    (acc, char) => ((acc ^ BigInt(char.charCodeAt(0))) * FNV_PRIME) & MASK_64,
    FNV_OFFSET
  );
  return hash.toString(16).padStart(16, '0');
};

export const buildMatomoTrackParams = ({
  config,
  event,
  userId,
  anonymousId,
  timestamp,
  properties
}: TrackParamsInput): URLSearchParams => {
  const { category, action } = splitEvent(event);
  const cdt = unixSeconds(timestamp);
  const value = numericValue(properties);
  const name = stringName(properties);
  return new URLSearchParams({
    idsite: config.siteId,
    rec: '1',
    e_c: category,
    e_a: action,
    ...(name !== undefined ? { e_n: name } : {}),
    ...(value !== undefined ? { e_v: value } : {}),
    ...(cdt !== undefined ? { cdt } : {}),
    ...(userId ? { uid: userId } : {}),
    ...(anonymousId ? { _id: matomoVisitorId(anonymousId) } : {}),
    ...customDimensionParams(properties, config.customDimensions)
  });
};

export const buildMatomoPageParams = ({
  config,
  name,
  url,
  referrer,
  userId,
  anonymousId,
  timestamp
}: PageParamsInput): URLSearchParams => {
  const cdt = unixSeconds(timestamp);
  return new URLSearchParams({
    idsite: config.siteId,
    rec: '1',
    ...(name ? { action_name: name } : {}),
    ...(url ? { url } : {}),
    ...(referrer ? { urlref: referrer } : {}),
    ...(cdt !== undefined ? { cdt } : {}),
    ...(userId ? { uid: userId } : {}),
    ...(anonymousId ? { _id: matomoVisitorId(anonymousId) } : {})
  });
};
