import { Middleware } from "grammy";

import { logger } from "@core/lib/logger";
import { Context } from "@core/types";

export const middleware = (): Middleware<Context> => (ctx, next) => {
  logger.debug({
    msg: "Telegram update",
    ...ctx.update,
  });
  return next();
};
