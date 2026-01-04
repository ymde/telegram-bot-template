/** Event names for activity logging */
export enum EventName {
  TEST = "test",
}

/** Metric keys for analytics tracking */
export enum MetricKey {
  TEST = "test",
}

/** Status for activity logs */
export type EventStatus = "success" | "error";

/** Row type for activity_logs table */
export interface ActivityLogRow {
  user_id: number;
  chat_id: number;
  event: EventName;
  params: Record<string, string>;
  result: Record<string, string>;
  status: EventStatus;
  created_at?: Date;
}

/** Row type for analytics table */
export interface AnalyticsRow {
  user_id: number;
  chat_id: number;
  key: MetricKey;
  args: Record<string, string>;
  value: number;
  created_at?: Date;
}

/** Input for standalone logEvent function */
export interface LogEventInput {
  userId: number;
  chatId: number;
  event: EventName;
  params?: Record<string, string>;
  result?: Record<string, string>;
  status?: EventStatus;
}

/** Input for standalone track function */
export interface TrackInput {
  userId: number;
  chatId: number;
  key: MetricKey;
  value?: number;
  args?: Record<string, string>;
}
