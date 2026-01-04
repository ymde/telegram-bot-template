import { apiCallsLogger } from "@core/transformers";
import { Bot } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import { I18n } from "@grammyjs/i18n";
import { limit as rateLimit } from "@grammyjs/ratelimiter";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import {
  setupAnalytics,
  setupLocalContext,
  setupLogger,
  setupSession,
  setupUpdatesLogger,
  setupUser,
} from "@core/middlewares";
import { Context } from "@core/types";
import path from "path";
import { conversations } from "@grammyjs/conversations";
import { enabledFeatures } from "@core/features";
import { config } from "./config";
import { EventName } from '@core/lib/analytics';

export const bot = new Bot<Context>(config.BOT_TOKEN);

// Middlewares

bot.api.config.use(apiThrottler());

if (config.isDevelopment) {
  bot.api.config.use(apiCallsLogger);
  bot.use(setupUpdatesLogger());
}

const i18n = new I18n({
  defaultLocale: "en",
  directory: path.join(__dirname, "..", "locales"),
  useSession: true,
});

bot.use(rateLimit());
bot.use(hydrate());
bot.use(setupSession());
bot.use(setupLocalContext());
bot.use(setupLogger());
bot.use(i18n.middleware());
bot.use(setupUser());
bot.use(setupAnalytics());
bot.use(conversations());

bot.use(...enabledFeatures);
