import { clickhouse } from "@app/clickhouse";
import type { ActivityLogRow, AnalyticsRow } from "./types";

interface BufferConfig {
  /** Max items before auto-flush. Default: 100 */
  maxSize?: number;
  /** Flush interval in ms. Default: 5000 (5s) */
  flushInterval?: number;
}

class AnalyticsBuffer {
  private activityLogs: ActivityLogRow[] = [];
  private analytics: AnalyticsRow[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly maxSize: number;
  private readonly flushInterval: number;
  private isClosed = false;

  constructor(config: BufferConfig = {}) {
    this.maxSize = config.maxSize ?? 100;
    this.flushInterval = config.flushInterval ?? 5000;
    this.startTimer();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  /** Queue an activity log row for insertion */
  pushActivityLog(row: ActivityLogRow): void {
    if (this.isClosed) return;
    this.activityLogs.push(row);
    if (this.activityLogs.length >= this.maxSize) {
      this.flushActivityLogs().catch(console.error);
    }
  }

  /** Queue an analytics row for insertion */
  pushAnalytics(row: AnalyticsRow): void {
    if (this.isClosed) return;
    this.analytics.push(row);
    if (this.analytics.length >= this.maxSize) {
      this.flushAnalytics().catch(console.error);
    }
  }

  /** Flush activity_logs table */
  private async flushActivityLogs(): Promise<void> {
    if (this.activityLogs.length === 0) return;

    const rows = this.activityLogs.splice(0, this.activityLogs.length);

    try {
      await clickhouse.insert({
        table: "activity_logs",
        values: rows,
        format: "JSONEachRow",
      });
    } catch (error) {
      console.error("[Analytics] Failed to flush activity_logs:", error);
      // Don't re-queue on error to prevent memory leak
    }
  }

  /** Flush analytics table */
  private async flushAnalytics(): Promise<void> {
    if (this.analytics.length === 0) return;

    const rows = this.analytics.splice(0, this.analytics.length);

    try {
      await clickhouse.insert({
        table: "analytics",
        values: rows,
        format: "JSONEachRow",
      });
    } catch (error) {
      console.error("[Analytics] Failed to flush analytics:", error);
    }
  }

  /** Flush all pending writes */
  async flush(): Promise<void> {
    await Promise.all([this.flushActivityLogs(), this.flushAnalytics()]);
  }

  /** Flush pending writes and stop the timer. Call on shutdown. */
  async close(): Promise<void> {
    this.isClosed = true;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    await this.flush();
    await clickhouse.close();
  }

  /** Get pending counts (for debugging) */
  get pending(): { activityLogs: number; analytics: number } {
    return {
      activityLogs: this.activityLogs.length,
      analytics: this.analytics.length,
    };
  }
}

export const analyticsBuffer = new AnalyticsBuffer();
