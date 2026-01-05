import { Middleware } from "grammy";
import { Context } from "@core/types";
import { InlineKeyboardMarkup, ParseMode } from "grammy/types";
import { MediaKey, getFileId, getFileType } from "@core/lib/media";

type MediaType = "video" | "photo" | "animation" | "document" | "audio";

interface BaseMediaOptions {
  caption?: string;
  parse_mode?: ParseMode;
  reply_markup?: InlineKeyboardMarkup;
}

interface ExplicitMediaOptions extends BaseMediaOptions {
  type: MediaType;
  media: string;
  localMediaId?: never;
}

interface LocalMediaOptions extends BaseMediaOptions {
  localMediaId: MediaKey;
  type?: never;
  media?: never;
}

export type EditOrReplyMediaOptions = ExplicitMediaOptions | LocalMediaOptions;

export interface EditOrReplyTextOptions {
  text: string;
  parse_mode?: ParseMode;
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditOrReplyFlavor {
  editOrReplyWithMedia: (options: EditOrReplyMediaOptions) => Promise<void>;
  editOrReplyWithText: (options: EditOrReplyTextOptions) => Promise<void>;
}

export const middleware = (): Middleware<Context> => (ctx, next) => {
  ctx.editOrReplyWithMedia = async (options: EditOrReplyMediaOptions) => {
    const { caption, parse_mode: parseMode, reply_markup: replyMarkup } =
      options;

    let type: MediaType;
    let media: string;

    if ("localMediaId" in options && options.localMediaId) {
      type = getFileType(options.localMediaId);
      media = getFileId(options.localMediaId);
    } else {
      type = options.type;
      media = options.media;
    }

    if (ctx.callbackQuery) {
      await ctx.editMessageMedia(
        { type, media, caption, parse_mode: parseMode },
        { reply_markup: replyMarkup },
      );
      return;
    }

    const replyOptions = {
      caption,
      reply_markup: replyMarkup,
      parse_mode: parseMode,
    };

    switch (type) {
      case "video":
        await ctx.replyWithVideo(media, replyOptions);
        break;
      case "photo":
        await ctx.replyWithPhoto(media, replyOptions);
        break;
      case "animation":
        await ctx.replyWithAnimation(media, replyOptions);
        break;
      case "document":
        await ctx.replyWithDocument(media, replyOptions);
        break;
      case "audio":
        await ctx.replyWithAudio(media, replyOptions);
        break;
      default:
        throw new Error(`Unknown media type ${type}`);
    }
  };

  ctx.editOrReplyWithText = async (options: EditOrReplyTextOptions) => {
    const { text, parse_mode: parseMode, reply_markup: replyMarkup } = options;

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, {
        parse_mode: parseMode,
        reply_markup: replyMarkup,
      });
      return;
    }

    await ctx.reply(text, { parse_mode: parseMode, reply_markup: replyMarkup });
  };

  return next();
};
