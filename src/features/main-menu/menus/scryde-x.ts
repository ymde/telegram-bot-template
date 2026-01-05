import { Context } from "@core/types";
import { MediaKey } from "@core/lib/media";
import { Menu } from "@grammyjs/menu";
import { startCommand } from "@core/features/main-menu/commands";

export const menu = new Menu<Context>("scryde-x");

export const joinMenu = async (ctx: Context) => {
  await ctx.editOrReplyWithMedia({
    localMediaId: MediaKey.SCRYDE_X,
    caption: "test 1234",
    reply_markup: menu,
  });
};

menu.text("prikol", startCommand);
