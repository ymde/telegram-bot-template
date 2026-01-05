import type { Context as DefaultContext, SessionFlavor } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";
import type { MenuFlavor } from "@grammyjs/menu";
import { LocalContext } from "@core/lib/context";

import { ConversationFlavor } from "@grammyjs/conversations";
import { HydrateFlavor } from "@grammyjs/hydrate";
import type { EventName, MetricKey, EventStatus } from "@core/lib/analytics";
import type {
  VariableValue,
  SetVariableOptions,
  LockedVariable,
} from "@core/lib/variables";
import type { EditOrReplyFlavor } from "@core/middlewares/setup-edit-or-reply.middleware";
import { type Session } from "./session";

export interface LocalContextFlavor {
  local: LocalContext;
}

export interface AnalyticsFlavor {
  /** Log an event (non-blocking, buffered) */
  logEvent: (
    event: EventName,
    params?: Record<string, string>,
    result?: Record<string, string>,
    status?: EventStatus,
  ) => void;
  /** Track a metric (non-blocking, buffered) */
  track: (
    key: MetricKey,
    value?: number,
    args?: Record<string, string>,
  ) => void;
}

export interface VariablesFlavor {
  getVariable: <T extends VariableValue = VariableValue>(
    key: string,
  ) => Promise<T | null>;
  setVariable: (
    key: string,
    value: VariableValue,
    options?: SetVariableOptions,
  ) => Promise<void>;
  deleteVariable: (key: string) => Promise<boolean>;
  hasVariable: (key: string) => Promise<boolean>;
  getVariableForUpdate: <T extends VariableValue = VariableValue, R = void>(
    key: string,
    callback: (locked: LockedVariable<T>) => Promise<R>,
  ) => Promise<R | null>;
}

export type Context = DefaultContext &
  SessionFlavor<Session> &
  LocalContextFlavor &
  AnalyticsFlavor &
  VariablesFlavor &
  EditOrReplyFlavor &
  I18nFlavor &
  MenuFlavor &
  ConversationFlavor<DefaultContext> &
  HydrateFlavor<DefaultContext>;
