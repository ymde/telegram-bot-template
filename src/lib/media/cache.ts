import { prisma } from "@core/app/database";

export enum MediaKey {
  MAIN_MENU = "MAIN_MENU",
  SCRYDE_X = "SCRYDE_X",
}

export type FileType = "video" | "photo" | "animation";

interface CacheEntry {
  fileId: string;
  fileType: FileType;
}

const fileIdCache = new Map<string, CacheEntry>();

export function getFileId(key: MediaKey): string {
  const entry = fileIdCache.get(key);
  if (!entry) {
    throw new Error(`File ID not found for key: ${key}`);
  }
  return entry.fileId;
}

export function getFileType(key: MediaKey): FileType {
  const entry = fileIdCache.get(key);
  if (!entry) {
    throw new Error(`File type not found for key: ${key}`);
  }
  return entry.fileType;
}

export function hasFileId(key: MediaKey): boolean {
  return fileIdCache.has(key);
}

export function getAllFileIds(): Map<string, CacheEntry> {
  return new Map(fileIdCache);
}

export async function reloadMediaCache(): Promise<void> {
  const files = await prisma.bot_files.findMany();
  fileIdCache.clear();
  // eslint-disable-next-line no-restricted-syntax
  for (const f of files) {
    fileIdCache.set(f.key, {
      fileId: f.file_id,
      fileType: f.file_type as FileType,
    });
  }
}

export function setFileIdInCache(
  key: string,
  fileId: string,
  fileType: FileType,
): void {
  fileIdCache.set(key, { fileId, fileType });
}
