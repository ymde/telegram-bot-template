import { Transformer } from "grammy";

import { logger } from "@core/lib/logger";

export const transformer: Transformer = (prev, method, payload, signal) => {
  logger.debug({
    msg: "Bot API call",
    method,
    payload,
  });
  return prev(method, payload, signal);
};
