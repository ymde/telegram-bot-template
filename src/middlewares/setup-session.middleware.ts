import { type Context } from "@core/types";
import { type Middleware, session } from "grammy";

export const middleware = (): Middleware<Context> =>
  session({
    initial: () => ({}),
  });
