/* eslint-disable no-console  */
import "reflect-metadata";
import "module-alias/register";

import { bot } from "@app/bot";
import { GrammyError, HttpError } from "grammy";
import { closeAnalytics } from "@core/lib/analytics";
import { syncMediaAssets } from "@core/lib/media";

const shutdown = async () => {
  console.log("Shutting down...");
  await bot.stop();
  await closeAnalytics();
  console.log("Shutdown complete.");
};

const bootstrap = async () => {
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  bot.catch((err) => {
    const { ctx } = err;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  await syncMediaAssets(bot.api);
  await bot.start();
};

bootstrap();

// Handle Vite HMR - do full reload to avoid Telegram getUpdates conflicts
if (import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", shutdown);
}
