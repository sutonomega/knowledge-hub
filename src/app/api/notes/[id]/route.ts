import { jsonError, unknownError } from "@/src/lib/api-response";
import { deleteNote, getNote, updateNote } from "@/src/lib/note-store";
import { parseNoteInput } from "@/src/lib/note-validation";

type NoteRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: NoteRouteContext,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const note = await getNote(id);

    if (!note) {
      return jsonError("ノートが見つかりません。", 404);
    }

    return Response.json(note);
  } catch (error) {
    return unknownError(error);
  }
}

export async function PUT(
  request: Request,
  context: NoteRouteContext,
): Promise<Response> {
  try {
    const parsed = parseNoteInput(await request.json());

    if (!parsed.ok) {
      return jsonError(parsed.message, 400);
    }

    const { id } = await context.params;
    const note = await updateNote(id, parsed.value);

    if (!note) {
      return jsonError("ノートが見つかりません。", 404);
    }

    return Response.json(note);
  } catch (error) {
    return unknownError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: NoteRouteContext,
): Promise<Response> {
  try {
    const { id } = await context.params;
    const deleted = await deleteNote(id);

    if (!deleted) {
      return jsonError("ノートが見つかりません。", 404);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return unknownError(error);
  }
}
