import pino, { Logger, LoggerOptions } from "pino";
import pretty from "pino-pretty";
import { config } from "@app/config";
import { context } from "@core/lib/context";

const options: LoggerOptions = {
  level: "debug",
};

let loggerInstance = pino(options);

if (config.isDevelopment) {
  loggerInstance = pino(
    options,
    pretty({
      ignore: "pid,hostname",
      colorize: true,
      translateTime: true,
    })
  );
}

const rawLogger = loggerInstance;

const logger: Logger = new Proxy(rawLogger, {
  get(target, property, receiver) {
    // eslint-disable-next-line no-param-reassign
    target = context.getStore()?.logger || target;
    return Reflect.get(target, property, receiver);
  },
});

export { logger, rawLogger };
