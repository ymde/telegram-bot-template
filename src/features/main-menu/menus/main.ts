import { Menu } from "@grammyjs/menu";
import { Context } from "@core/types";
import { trans } from "@core/lib/helpers";
import { joinMenu } from "@core/features/main-menu/menus/scryde-x";

export const menu = new Menu<Context>("main-menu");

menu
  .text(trans("main_menu-scryde_x"), joinMenu)
  .row()
  .text(trans("main_menu-promo"), (ctx) => {})
  .text(trans("main_menu-site"), (ctx) => {})
  .row()
  .text(trans("main_menu-essence"), (ctx) => {})
  .row()
  .text(trans("main_menu-support"), (ctx) => {})
  .row()
  .text(trans("main_menu-switch_language"), (ctx) => {});
