export type NoteSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Note = NoteSummary & {
  content: string;
};

export type NoteInput = {
  title: string;
  content: string;
  tags: string[];
};

export type TagSummary = {
  name: string;
  count: number;
};

export type ApiError = {
  error: string;
};

export type NotesResponse = {
  notes: NoteSummary[];
};

export type TagsResponse = {
  tags: TagSummary[];
};

export type SearchResponse = {
  query: string;
  notes: NoteSummary[];
};
