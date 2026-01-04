import { Middleware } from "grammy";
import { context, LocalContext } from "@core/lib/context";
import { Context } from "@core/types";

export const middleware = (): Middleware<Context> => (ctx, next) => {
  return context.run({}, () => {
    ctx.local = context.getStore() as LocalContext;
    return next();
  });
};
