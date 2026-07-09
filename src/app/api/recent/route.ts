import { unknownError } from "@/src/lib/api-response";
import { listNotes } from "@/src/lib/note-store";
import type { NotesResponse } from "@/src/types/knowledge";

export async function GET(): Promise<Response> {
  try {
    const body: NotesResponse = {
      notes: (await listNotes()).slice(0, 8),
    };

    return Response.json(body);
  } catch (error) {
    return unknownError(error);
  }
}
