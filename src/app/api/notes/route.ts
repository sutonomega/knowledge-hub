import { jsonError, unknownError } from "@/src/lib/api-response";
import { createNote, listNotes } from "@/src/lib/note-store";
import { parseNoteInput } from "@/src/lib/note-validation";
import type { NotesResponse } from "@/src/types/knowledge";

export async function GET(): Promise<Response> {
  try {
    const body: NotesResponse = { notes: await listNotes() };
    return Response.json(body);
  } catch (error) {
    return unknownError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = parseNoteInput(await request.json());

    if (!parsed.ok) {
      return jsonError(parsed.message, 400);
    }

    const note = await createNote(parsed.value);
    return Response.json(note, { status: 201 });
  } catch (error) {
    return unknownError(error);
  }
}
