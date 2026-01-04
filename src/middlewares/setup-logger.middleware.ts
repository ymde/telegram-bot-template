import { Middleware } from "grammy";

import { Context } from "@core/types";
import { rawLogger } from "@core/lib/logger";

export const middleware = (): Middleware<Context> => (ctx, next) => {
  ctx.local.logger = rawLogger.child({
    update_id: ctx.update.update_id,
    userId: ctx.local.user?.id,
  });

  return next();
};
