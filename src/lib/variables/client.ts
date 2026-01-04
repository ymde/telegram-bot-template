import { prisma } from "@core/app/database";
import { Prisma } from "../../../generated/prisma/client";

export type VariableValue = Prisma.InputJsonValue;

export interface SetVariableOptions {
  expiresAt?: Date;
}

export async function getVariable<T extends VariableValue = VariableValue>(
  userId: number,
  key: string,
): Promise<T | null> {
  const record = await prisma.user_variables.findUnique({
    where: { user_id_key: { user_id: userId, key } },
  });

  if (!record) return null;

  if (record.expires_at && record.expires_at < new Date()) {
    await prisma.user_variables.delete({
      where: { id: record.id },
    });
    return null;
  }

  return record.value as T;
}

export async function setVariable(
  userId: number,
  key: string,
  value: VariableValue,
  options?: SetVariableOptions,
): Promise<void> {
  await prisma.user_variables.upsert({
    where: { user_id_key: { user_id: userId, key } },
    update: {
      value,
      expires_at: options?.expiresAt ?? null,
    },
    create: {
      user_id: userId,
      key,
      value,
      expires_at: options?.expiresAt ?? null,
    },
  });
}

export async function deleteVariable(
  userId: number,
  key: string,
): Promise<boolean> {
  try {
    await prisma.user_variables.delete({
      where: { user_id_key: { user_id: userId, key } },
    });
    return true;
  } catch {
    return false;
  }
}

export async function hasVariable(
  userId: number,
  key: string,
): Promise<boolean> {
  const value = await getVariable(userId, key);
  return value !== null;
}

type TransactionClient = Prisma.TransactionClient;

export interface LockedVariable<T extends VariableValue> {
  value: T | null;
  tx: TransactionClient;
  set: (value: VariableValue, options?: SetVariableOptions) => Promise<void>;
  delete: () => Promise<boolean>;
}

export async function getVariableForUpdate<
  T extends VariableValue = VariableValue,
  R = void,
>(
  userId: number,
  key: string,
  callback: (locked: LockedVariable<T>) => Promise<R>,
): Promise<R> {
  return prisma.$transaction(async (tx) => {
    // Use raw query for SELECT ... FOR UPDATE
    const rows = await tx.$queryRaw<{ value: T; expires_at: Date | null }[]>`
      SELECT value, expires_at FROM user_variables
      WHERE user_id = ${userId} AND \`key\` = ${key}
      FOR UPDATE
    `;

    let currentValue: T | null = null;

    if (rows.length > 0) {
      const record = rows[0];
      // Check if expired
      if (record.expires_at && record.expires_at < new Date()) {
        await tx.user_variables.delete({
          where: { user_id_key: { user_id: userId, key } },
        });
      } else {
        currentValue = record.value;
      }
    }

    const locked: LockedVariable<T> = {
      value: currentValue,
      tx,
      set: async (value: VariableValue, options?: SetVariableOptions) => {
        await tx.user_variables.upsert({
          where: { user_id_key: { user_id: userId, key } },
          update: {
            value,
            expires_at: options?.expiresAt ?? null,
          },
          create: {
            user_id: userId,
            key,
            value,
            expires_at: options?.expiresAt ?? null,
          },
        });
      },
      delete: async () => {
        try {
          await tx.user_variables.delete({
            where: { user_id_key: { user_id: userId, key } },
          });
          return true;
        } catch {
          return false;
        }
      },
    };

    return callback(locked);
  });
}

export async function cleanupExpiredVariables(): Promise<number> {
  const result = await prisma.user_variables.deleteMany({
    where: {
      expires_at: { lt: new Date() },
    },
  });
  return result.count;
}
