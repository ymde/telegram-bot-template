import { Middleware } from "grammy";

import { Context } from "@core/types";
import { prisma } from "@app/database";

export const middleware = (): Middleware<Context> => async (ctx, next) => {
  if (ctx.from?.is_bot || !ctx.from) {
    return next();
  }

  const { id: telegramId } = ctx.from;

  let user = await prisma.users.findFirst({
    where: {
      telegram_id: telegramId,
    },
  });

  if (!user) {
    user = await prisma.users.create({
      data: {
        telegram_id: telegramId,
      },
    });
  }

  ctx.local.user = user;

  return next();
};
