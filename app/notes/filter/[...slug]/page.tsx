import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNotes } from "../../../../lib/api";
import { NoteListResponse } from "../../../../types/note";
import NotesClient from "./Notes.client";

interface NotesPageProps {
  params: {
    slug?: string[];
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const revalidate = 60;

export default async function Notes({ params, searchParams }: NotesPageProps) {
  const awaitedParams = await Promise.resolve(params);
  const awaitedSearchParams = await Promise.resolve(searchParams);
  const initialPage = Number(awaitedSearchParams?.page) || 1;
  const initialQuery = (awaitedSearchParams?.q as string) || "";
  const tagFromSlug =
    awaitedParams.slug?.[0] === "all" ? undefined : awaitedParams.slug?.[0];
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery<NoteListResponse, Error>({
    queryKey: ["notes", initialQuery, initialPage, tagFromSlug], // Додайте всі параметри, які впливають на фетчинг
    queryFn: () => fetchNotes(initialQuery, initialPage, tagFromSlug),
  });
  const initialData = queryClient.getQueryData<NoteListResponse>([
    "notes",
    initialQuery,
    initialPage,
    tagFromSlug,
  ]) || { notes: [], totalPages: 1 };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient
        initialQuery={initialQuery}
        initialPage={initialPage}
        initialTag={tagFromSlug}
        initialData={initialData}
      />
    </HydrationBoundary>
  );
}
