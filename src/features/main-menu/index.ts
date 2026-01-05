import { Composer } from "grammy";
import { Context } from "@core/types";
import { mainMenu, scrydeX } from "./menus";
import { startCommand } from "./commands";

export const composer = new Composer<Context>();

mainMenu.register(scrydeX);

composer.use(mainMenu);

const feature = composer.chatType("private");

feature.command("start", startCommand);
