import { unknownError } from "@/src/lib/api-response";
import { listNotesByTag } from "@/src/lib/note-store";
import type { NotesResponse } from "@/src/types/knowledge";

type TagRouteContext = {
  params: Promise<{
    name: string;
  }>;
};

export async function GET(
  _request: Request,
  context: TagRouteContext,
): Promise<Response> {
  try {
    const { name } = await context.params;
    const body: NotesResponse = {
      notes: await listNotesByTag(name),
    };

    return Response.json(body);
  } catch (error) {
    return unknownError(error);
  }
}
