import type { ApiError } from "@/src/types/knowledge";

export function jsonError(message: string, status: number): Response {
  const body: ApiError = { error: message };
  return Response.json(body, { status });
}

export function unknownError(error: unknown): Response {
  console.error(error);
  return jsonError("サーバーでエラーが発生しました。", 500);
}
