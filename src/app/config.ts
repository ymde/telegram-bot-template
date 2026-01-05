import "dotenv/config";
import { bool, cleanEnv, num, str } from "envalid";

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production"],
    default: "development",
  }),
  LOG_LEVEL: str({
    choices: ["trace", "debug", "info", "warn", "error", "fatal", "silent"],
    default: "debug",
  }),
  BOT_TOKEN: str(),

  BOT_UPLOAD_CHAT_ID: num(),

  DATABASE_HOST: str(),
  DATABASE_PORT: num({ default: 3306 }),
  DATABASE_INTERNAL_PORT: num({ default: 3306 }),
  DATABASE_USER: str(),
  DATABASE_DATABASE: str(),
  DATABASE_PASSWORD: str(),

  DATABASE_DEBUG: bool({
    default: false,
    devDefault: true,
  }),

  CLICKHOUSE_HOST: str({ default: "127.0.0.1" }),
  CLICKHOUSE_HTTP_PORT: num({ default: 8123 }),
  CLICKHOUSE_DATABASE: str({ default: "analytics" }),
  CLICKHOUSE_USER: str({ default: "default" }),
  CLICKHOUSE_PASSWORD: str({ default: "" }),
});
