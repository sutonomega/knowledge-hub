import { NoteWorkspace } from "@/src/features/notes/note-workspace";
import { listNotes, listTags } from "@/src/lib/note-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [notes, tags] = await Promise.all([listNotes(), listTags()]);

  return <NoteWorkspace initialNotes={notes} initialTags={tags} />;
}
