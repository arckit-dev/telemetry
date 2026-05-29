import { AsyncLocalStorage } from 'node:async_hooks';
import type { Identity, TelemetryScope, Traced } from './context.type';

const scopeStore = new AsyncLocalStorage<TelemetryScope>();
const identityStore = new AsyncLocalStorage<Identity>();
const traceStore = new AsyncLocalStorage<Traced>();

export const runWithScope = <T>(scope: TelemetryScope, fn: () => T): T => scopeStore.run(scope, fn);

export const runWithIdentity = <T>(identity: Identity, fn: () => T): T => identityStore.run(identity, fn);

export const runWithTrace = <T>(trace: Traced, fn: () => T): T => traceStore.run(trace, fn);

export const enterScope = (scope: TelemetryScope): void => scopeStore.enterWith(scope);

export const enterIdentity = (identity: Identity): void => identityStore.enterWith(identity);

export const enterTrace = (trace: Traced): void => traceStore.enterWith(trace);

export const getScope = (): TelemetryScope | undefined => scopeStore.getStore();

export const getIdentity = (): Identity | undefined => identityStore.getStore();

export const getTrace = (): Traced | undefined => traceStore.getStore();
