import { Context } from "@core/types";
import { MediaKey } from "@core/lib/media";
import { menu } from "../menus/main";

export const command = async (ctx: Context) => {
  await ctx.editOrReplyWithMedia({
    localMediaId: MediaKey.MAIN_MENU,
    caption: ctx.t("main_menu-start"),
    parse_mode: "HTML",
    reply_markup: menu,
  });
};
