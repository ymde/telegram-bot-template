/* eslint-disable no-console,no-continue,no-restricted-syntax */
import { Api, InputFile, RawApi } from "grammy";
import { prisma } from "@core/app/database";
import { createHash } from "crypto";
import { readdirSync, readFileSync } from "fs";
import { join, extname, basename } from "path";
import { config } from "@core/app/config";
import { logger } from "@core/lib/logger";
import { FileType, reloadMediaCache, setFileIdInCache } from "./cache";

const ASSETS_DIR = join(__dirname, "..", "..", "..", "assets");

const EXTENSION_TO_TYPE: Record<string, FileType> = {
  ".mp4": "video",
  ".mov": "video",
  ".jpg": "photo",
  ".jpeg": "photo",
  ".png": "photo",
  ".gif": "animation",
};

function getFileHash(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

function fileNameToKey(fileName: string): string {
  const name = basename(fileName, extname(fileName));
  return name.toUpperCase().replace(/-/g, "_");
}

function getFileType(filePath: string): FileType | null {
  const ext = extname(filePath).toLowerCase();
  return EXTENSION_TO_TYPE[ext] ?? null;
}

interface AssetFile {
  path: string;
  key: string;
  hash: string;
  type: FileType;
}

function scanAssets(): AssetFile[] {
  const files: AssetFile[] = [];

  let entries: string[];
  try {
    entries = readdirSync(ASSETS_DIR);
  } catch {
    logger.error({
      msg: `Assets directory not found: ${ASSETS_DIR}`,
    });
    return files;
  }

  for (const entry of entries) {
    const filePath = join(ASSETS_DIR, entry);
    const fileType = getFileType(filePath);

    if (!fileType) continue;

    files.push({
      path: filePath,
      key: fileNameToKey(entry),
      hash: getFileHash(filePath),
      type: fileType,
    });
  }

  return files;
}

async function uploadFile(api: Api, asset: AssetFile): Promise<string> {
  const inputFile = new InputFile(asset.path);

  let fileId: string;

  switch (asset.type) {
    case "video": {
      const result = await api.sendVideo(config.BOT_UPLOAD_CHAT_ID, inputFile);
      fileId = result.video.file_id;
      await api.deleteMessage(result.chat.id, result.message_id);
      break;
    }
    case "photo": {
      const result = await api.sendPhoto(config.BOT_UPLOAD_CHAT_ID, inputFile);
      fileId = result.photo[result.photo.length - 1].file_id;
      await api.deleteMessage(result.chat.id, result.message_id);
      break;
    }
    case "animation": {
      const result = await api.sendAnimation(
        config.BOT_UPLOAD_CHAT_ID,
        inputFile,
      );
      fileId = result.animation.file_id;
      await api.deleteMessage(result.chat.id, result.message_id);
      break;
    }

    default: {
      throw new Error(`Unsupported media type ${asset.type}`);
    }
  }

  return fileId;
}

export async function syncMediaAssets(api: Api<RawApi>): Promise<void> {
  logger.info({
    msg: "Syncing media assets...",
  });

  const assets = scanAssets();

  if (assets.length === 0) {
    logger.debug({
      msg: "No assets found, loading cache from DB",
    });
    await reloadMediaCache();
    return;
  }

  const existingFiles = await prisma.bot_files.findMany();
  const existingByKey = new Map(existingFiles.map((f) => [f.key, f]));

  for (const asset of assets) {
    const existing = existingByKey.get(asset.key);

    if (existing && existing.file_hash === asset.hash) {
      logger.debug({
        msg: `${asset.key}: unchanged`,
      });

      setFileIdInCache(asset.key, existing.file_id, asset.type);
      continue;
    }

    logger.debug({
      msg: `${asset.key}: ${existing ? "changed, re-uploading" : "new, uploading"}...`,
    });

    const fileId = await uploadFile(api, asset);

    await prisma.bot_files.upsert({
      where: { key: asset.key },
      update: {
        file_id: fileId,
        file_hash: asset.hash,
        file_type: asset.type,
      },
      create: {
        key: asset.key,
        file_id: fileId,
        file_hash: asset.hash,
        file_type: asset.type,
      },
    });

    setFileIdInCache(asset.key, fileId, asset.type);

    logger.debug({
      msg: `${asset.key}: uploaded successfully`,
    });
  }

  logger.info({
    msg: `Media sync complete`,
  });
}
