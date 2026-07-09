import { unknownError } from "@/src/lib/api-response";
import { searchNotes } from "@/src/lib/note-store";
import type { SearchResponse } from "@/src/types/knowledge";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const body: SearchResponse = {
      query,
      notes: await searchNotes(query),
    };

    return Response.json(body);
  } catch (error) {
    return unknownError(error);
  }
}
