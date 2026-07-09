"use client";

import { useMemo, useState } from "react";
import { MarkdownPreview } from "@/src/components/markdown-preview";
import type { Note, NoteInput, NoteSummary, TagSummary } from "@/src/types/knowledge";

type ViewMode = "edit" | "preview" | "split";

type NoteWorkspaceProps = {
  initialNotes: NoteSummary[];
  initialTags: TagSummary[];
};

const EMPTY_NOTE: NoteInput = {
  title: "",
  content: "# 新しいノート\n\nここに本文を書きます。",
  tags: [],
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(error?.error ?? "リクエストに失敗しました。");
  }

  return (await response.json()) as T;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseTags(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const tag of value.split(",")) {
    const normalized = tag.trim();
    const key = normalized.toLocaleLowerCase();

    if (!normalized || seen.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push(normalized);
  }

  return tags;
}

export function NoteWorkspace({
  initialNotes,
  initialTags,
}: NoteWorkspaceProps) {
  const [notes, setNotes] = useState<NoteSummary[]>(initialNotes);
  const [tags, setTags] = useState<TagSummary[]>(initialTags);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [draft, setDraft] = useState<NoteInput>(EMPTY_NOTE);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [status, setStatus] = useState("準備完了");
  const [isBusy, setIsBusy] = useState(false);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return notes.filter((note) => {
      const matchesTag = activeTag
        ? note.tags.some((tag) => tag.toLocaleLowerCase() === activeTag.toLocaleLowerCase())
        : true;
      const matchesQuery = normalizedQuery
        ? [note.title, note.excerpt, ...note.tags]
            .join("\n")
            .toLocaleLowerCase()
            .includes(normalizedQuery)
        : true;

      return matchesTag && matchesQuery;
    });
  }, [activeTag, notes, query]);

  async function refreshLists(): Promise<void> {
    const [notesResponse, tagsResponse] = await Promise.all([
      requestJson<{ notes: NoteSummary[] }>("/api/notes"),
      requestJson<{ tags: TagSummary[] }>("/api/tags"),
    ]);
    setNotes(notesResponse.notes);
    setTags(tagsResponse.tags);
  }

  async function selectNote(id: string): Promise<void> {
    setIsBusy(true);
    setStatus("ノートを読み込んでいます");

    try {
      const note = await requestJson<Note>(`/api/notes/${id}`);
      setSelectedNote(note);
      setDraft({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
      setStatus("読み込みました");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "読み込みに失敗しました");
    } finally {
      setIsBusy(false);
    }
  }

  function startNewNote(): void {
    setSelectedNote(null);
    setDraft(EMPTY_NOTE);
    setStatus("新規ノートを作成中");
  }

  async function saveNote(): Promise<void> {
    setIsBusy(true);
    setStatus("保存しています");

    try {
      const payload = JSON.stringify(draft);
      const note = selectedNote
        ? await requestJson<Note>(`/api/notes/${selectedNote.id}`, {
            method: "PUT",
            body: payload,
          })
        : await requestJson<Note>("/api/notes", {
            method: "POST",
            body: payload,
          });

      setSelectedNote(note);
      setDraft({
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
      await refreshLists();
      setStatus("保存しました");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setIsBusy(false);
    }
  }

  async function removeNote(): Promise<void> {
    if (!selectedNote) {
      return;
    }

    setIsBusy(true);
    setStatus("削除しています");

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました。");
      }

      setSelectedNote(null);
      setDraft(EMPTY_NOTE);
      await refreshLists();
      setStatus("削除しました");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsBusy(false);
    }
  }

  async function runFullTextSearch(): Promise<void> {
    setIsBusy(true);
    setActiveTag(null);
    setStatus("検索しています");

    try {
      const result = await requestJson<{ notes: NoteSummary[] }>(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      setNotes(result.notes);
      setStatus("検索結果を表示しています");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "検索に失敗しました");
    } finally {
      setIsBusy(false);
    }
  }

  async function clearFilters(): Promise<void> {
    setQuery("");
    setActiveTag(null);
    setIsBusy(true);

    try {
      await refreshLists();
      setStatus("一覧を更新しました");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      setIsBusy(false);
    }
  }

  const tagText = draft.tags.join(", ");
  const hasSelectedNote = selectedNote !== null;

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Knowledge Hub</p>
            <h1 className="text-2xl font-semibold tracking-normal">Markdown ノート管理</h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void runFullTextSearch();
                }
              }}
              className="h-10 min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:w-80"
              placeholder="タイトル・本文・タグを検索"
            />
            <button
              type="button"
              onClick={() => void runFullTextSearch()}
              disabled={isBusy}
              className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              検索
            </button>
            <button
              type="button"
              onClick={() => void clearFilters()}
              disabled={isBusy}
              className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              解除
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-md border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-sm font-semibold">ノート</h2>
              <button
                type="button"
                onClick={startNewNote}
                className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-teal-800"
              >
                新規
              </button>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <p className="px-4 py-8 text-sm text-zinc-500">ノートがありません。</p>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    type="button"
                    key={note.id}
                    onClick={() => void selectNote(note.id)}
                    className={`block w-full border-b border-zinc-100 px-4 py-3 text-left transition hover:bg-stone-100 ${
                      selectedNote?.id === note.id ? "bg-teal-50" : "bg-white"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{note.title}</span>
                    <span className="mt-1 block truncate text-xs text-zinc-500">
                      {note.excerpt || "本文なし"}
                    </span>
                    <span className="mt-2 block text-xs text-zinc-400">
                      {formatDate(note.updatedAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-md border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold">タグ</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-zinc-500">タグはまだありません。</p>
              ) : (
                tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.name}
                    onClick={() => setActiveTag(tag.name)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                      activeTag === tag.name
                        ? "border-teal-700 bg-teal-50 text-teal-800"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-stone-100"
                    }`}
                  >
                    {tag.name} {tag.count}
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>

        <section className="rounded-md border border-zinc-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(180px,260px)]">
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className="h-11 min-w-0 rounded-md border border-zinc-300 px-3 text-base font-semibold outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="ノートタイトル"
              />
              <input
                value={tagText}
                onChange={(event) =>
                  setDraft({ ...draft, tags: parseTags(event.target.value) })
                }
                className="h-11 min-w-0 rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="タグ（カンマ区切り）"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["edit", "preview", "split"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`h-10 rounded-md px-3 text-sm font-medium ${
                    viewMode === mode
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-300 bg-white hover:bg-zinc-100"
                  }`}
                >
                  {mode === "edit" ? "編集" : mode === "preview" ? "閲覧" : "分割"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void saveNote()}
                disabled={isBusy}
                className="h-10 rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => void removeNote()}
                disabled={isBusy || !hasSelectedNote}
                className="h-10 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                削除
              </button>
            </div>
          </div>

          <div
            className={`grid min-h-[620px] ${
              viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {viewMode !== "preview" && (
              <textarea
                value={draft.content}
                onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                className="min-h-[620px] resize-y border-0 border-zinc-200 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-50 outline-none lg:border-r"
                spellCheck={false}
              />
            )}
            {viewMode !== "edit" && (
              <div className="min-h-[620px] overflow-y-auto p-6">
                <MarkdownPreview content={draft.content} />
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-2 border-t border-zinc-200 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{status}</span>
            <span>
              {selectedNote
                ? `更新: ${formatDate(selectedNote.updatedAt)}`
                : "未保存の新規ノート"}
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
