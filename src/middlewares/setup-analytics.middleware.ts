import { Middleware } from "grammy";
import { Context } from "@core/types";
import { logEvent, track } from "@core/lib/analytics";
import type { EventName, MetricKey, EventStatus } from "@core/lib/analytics";

export const middleware = (): Middleware<Context> => (ctx, next) => {
  const userId = ctx.from?.id ?? 0;
  const chatId = ctx.chat?.id ?? userId;

  ctx.logEvent = (
    event: EventName,
    params?: Record<string, string>,
    result?: Record<string, string>,
    status?: EventStatus
  ) => {
    logEvent({ userId, chatId, event, params, result, status });
  };

  ctx.track = (
    key: MetricKey,
    value?: number,
    args?: Record<string, string>
  ) => {
    track({ userId, chatId, key, value, args });
  };

  return next();
};
