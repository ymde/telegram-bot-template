import { AsyncLocalStorage } from "async_hooks";
import { Logger } from "pino";

export enum Language {
  RU = "RU",
  EN = "EN",
}

export interface User {
  id: number;
  telegram_id: bigint;
  username: string | null;
  first_name: string | null;
  language: "RU" | "EN";
  is_banned: boolean;
  created_at: Date;
}

export interface LocalContext {
  logger?: Logger;
  user?: User;
}

export const context = new AsyncLocalStorage<LocalContext>();
