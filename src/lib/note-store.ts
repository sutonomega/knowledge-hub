import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Note, NoteInput, NoteSummary, TagSummary } from "@/src/types/knowledge";

type NoteIndexItem = {
  id: string;
  title: string;
  slug: string;
  path: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type StoreIndex = {
  notes: NoteIndexItem[];
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
const NOTES_DIR = path.join(STORAGE_DIR, "notes");
const INDEX_PATH = path.join(STORAGE_DIR, "index.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(NOTES_DIR, { recursive: true });

  try {
    await fs.access(INDEX_PATH);
  } catch {
    const initialIndex: StoreIndex = { notes: [] };
    await fs.writeFile(INDEX_PATH, JSON.stringify(initialIndex, null, 2), "utf8");
  }
}

async function readIndex(): Promise<StoreIndex> {
  await ensureStore();
  const content = await fs.readFile(INDEX_PATH, "utf8");
  const parsed = JSON.parse(content) as StoreIndex;

  return {
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
  };
}

async function writeIndex(index: StoreIndex): Promise<void> {
  await ensureStore();
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
}

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "note";
}

function makeExcerpt(content: string): string {
  return content
    .replace(/^#+\s+/gm, "")
    .replace(/[`*_#[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function toSummary(item: NoteIndexItem, content: string): NoteSummary {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: makeExcerpt(content),
    tags: item.tags,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function readNoteContent(item: NoteIndexItem): Promise<string> {
  return fs.readFile(path.join(STORAGE_DIR, item.path), "utf8");
}

function sortByUpdatedAt(notes: NoteSummary[]): NoteSummary[] {
  return notes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function listNotes(): Promise<NoteSummary[]> {
  const index = await readIndex();
  const notes = await Promise.all(
    index.notes.map(async (item) => toSummary(item, await readNoteContent(item))),
  );

  return sortByUpdatedAt(notes);
}

export async function getNote(id: string): Promise<Note | null> {
  const index = await readIndex();
  const item = index.notes.find((note) => note.id === id);

  if (!item) {
    return null;
  }

  const content = await readNoteContent(item);

  return {
    ...toSummary(item, content),
    content,
  };
}

export async function createNote(input: NoteInput): Promise<Note> {
  const index = await readIndex();
  const now = new Date().toISOString();
  const id = randomUUID();
  const item: NoteIndexItem = {
    id,
    title: input.title,
    slug: slugify(input.title),
    path: `notes/${id}.md`,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };

  await fs.writeFile(path.join(STORAGE_DIR, item.path), input.content, "utf8");
  await writeIndex({ notes: [item, ...index.notes] });

  return {
    ...toSummary(item, input.content),
    content: input.content,
  };
}

export async function updateNote(id: string, input: NoteInput): Promise<Note | null> {
  const index = await readIndex();
  const noteIndex = index.notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) {
    return null;
  }

  const existing = index.notes[noteIndex];
  const updated: NoteIndexItem = {
    ...existing,
    title: input.title,
    slug: slugify(input.title),
    tags: input.tags,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(path.join(STORAGE_DIR, existing.path), input.content, "utf8");

  const notes = [...index.notes];
  notes[noteIndex] = updated;
  await writeIndex({ notes });

  return {
    ...toSummary(updated, input.content),
    content: input.content,
  };
}

export async function deleteNote(id: string): Promise<boolean> {
  const index = await readIndex();
  const item = index.notes.find((note) => note.id === id);

  if (!item) {
    return false;
  }

  await fs.rm(path.join(STORAGE_DIR, item.path), { force: true });
  await writeIndex({ notes: index.notes.filter((note) => note.id !== id) });

  return true;
}

export async function searchNotes(query: string): Promise<NoteSummary[]> {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const notes = await listNotes();

  if (!normalizedQuery) {
    return notes;
  }

  const results: NoteSummary[] = [];

  for (const summary of notes) {
    const note = await getNote(summary.id);

    if (!note) {
      continue;
    }

    const searchable = [
      note.title,
      note.content,
      note.excerpt,
      ...note.tags,
    ]
      .join("\n")
      .toLocaleLowerCase();

    if (searchable.includes(normalizedQuery)) {
      results.push(summary);
    }
  }

  return results;
}

export async function listTags(): Promise<TagSummary[]> {
  const notes = await listNotes();
  const counts = new Map<string, number>();

  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export async function listNotesByTag(name: string): Promise<NoteSummary[]> {
  const normalizedTag = decodeURIComponent(name).toLocaleLowerCase();
  const notes = await listNotes();

  return notes.filter((note) =>
    note.tags.some((tag) => tag.toLocaleLowerCase() === normalizedTag),
  );
}
