import { Context } from "@core/types";

export const helper = (i18nKey: string) => (ctx: Context) => ctx.t(i18nKey);
