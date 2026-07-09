import { unknownError } from "@/src/lib/api-response";
import { listTags } from "@/src/lib/note-store";
import type { TagsResponse } from "@/src/types/knowledge";

export async function GET(): Promise<Response> {
  try {
    const body: TagsResponse = { tags: await listTags() };
    return Response.json(body);
  } catch (error) {
    return unknownError(error);
  }
}
