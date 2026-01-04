import { createClient } from "@clickhouse/client";
import { config } from "./config";

export const clickhouse = createClient({
  url: `http://${config.CLICKHOUSE_HOST}:${config.CLICKHOUSE_HTTP_PORT}`,
  database: config.CLICKHOUSE_DATABASE,
  username: config.CLICKHOUSE_USER,
  password: config.CLICKHOUSE_PASSWORD,
});
