import { analyticsBuffer } from "./buffer";
import type { LogEventInput, TrackInput } from "./types";

/**
 * Log an event to activity_logs table (non-blocking, buffered).
 * Use for business events like lootbox opens, purchases, etc.
 */
export function logEvent(input: LogEventInput): void {
  analyticsBuffer.pushActivityLog({
    user_id: input.userId,
    chat_id: input.chatId,
    event: input.event,
    params: input.params ?? {},
    result: input.result ?? {},
    status: input.status ?? "success",
  });
}

/**
 * Track a metric in analytics table (non-blocking, buffered).
 * Use for countable/summable metrics like coins spent, items received, etc.
 */
export function track(input: TrackInput): void {
  analyticsBuffer.pushAnalytics({
    user_id: input.userId,
    chat_id: input.chatId,
    key: input.key,
    value: input.value ?? 1,
    args: input.args ?? {},
  });
}

/**
 * Queue multiple events for insertion.
 */
export function logEventBatch(inputs: LogEventInput[]): void {
  for (const input of inputs) {
    logEvent(input);
  }
}

/**
 * Queue multiple metrics for insertion.
 */
export function trackBatch(inputs: TrackInput[]): void {
  for (const input of inputs) {
    track(input);
  }
}

/** Flush all pending writes immediately */
export async function flushAnalytics(): Promise<void> {
  await analyticsBuffer.flush();
}

/** Close analytics buffer and connection. Call on shutdown. */
export async function closeAnalytics(): Promise<void> {
  await analyticsBuffer.close();
}
