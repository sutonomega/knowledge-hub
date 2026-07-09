import type { NoteInput } from "@/src/types/knowledge";

const MAX_TITLE_LENGTH = 120;
const MAX_CONTENT_LENGTH = 200_000;
const MAX_TAG_LENGTH = 32;
const MAX_TAGS = 12;

type ParseResult =
  | { ok: true; value: NoteInput }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const tag = item.trim();
    const key = tag.toLocaleLowerCase();

    if (!tag || tag.length > MAX_TAG_LENGTH || seen.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push(tag);

    if (tags.length >= MAX_TAGS) {
      break;
    }
  }

  return tags;
}

export function parseNoteInput(value: unknown): ParseResult {
  if (!isRecord(value)) {
    return { ok: false, message: "リクエスト形式が正しくありません。" };
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const content = typeof value.content === "string" ? value.content : "";

  if (!title) {
    return { ok: false, message: "タイトルを入力してください。" };
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, message: "タイトルが長すぎます。" };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return { ok: false, message: "本文が長すぎます。" };
  }

  return {
    ok: true,
    value: {
      title,
      content,
      tags: normalizeTags(value.tags),
    },
  };
}
