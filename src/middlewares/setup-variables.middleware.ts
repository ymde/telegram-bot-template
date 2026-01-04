import { Middleware } from "grammy";
import { Context } from "@core/types";
import {
  getVariable,
  setVariable,
  deleteVariable,
  hasVariable,
  getVariableForUpdate,
  type VariableValue,
  type SetVariableOptions,
  type LockedVariable,
} from "@core/lib/variables";

export const middleware = (): Middleware<Context> => (ctx, next) => {
  const userId = ctx.local.user?.id;

  ctx.getVariable = async <T extends VariableValue = VariableValue>(
    key: string,
  ): Promise<T | null> => {
    if (!userId) return null;
    return getVariable<T>(userId, key);
  };

  ctx.setVariable = async (
    key: string,
    value: VariableValue,
    options?: SetVariableOptions,
  ): Promise<void> => {
    if (!userId) return;
    return setVariable(userId, key, value, options);
  };

  ctx.deleteVariable = async (key: string): Promise<boolean> => {
    if (!userId) return false;
    return deleteVariable(userId, key);
  };

  ctx.hasVariable = async (key: string): Promise<boolean> => {
    if (!userId) return false;
    return hasVariable(userId, key);
  };

  ctx.getVariableForUpdate = async <
    T extends VariableValue = VariableValue,
    R = void,
  >(
    key: string,
    callback: (locked: LockedVariable<T>) => Promise<R>,
  ): Promise<R | null> => {
    if (!userId) return null;
    return getVariableForUpdate<T, R>(userId, key, callback);
  };

  return next();
};
