import useSWR from "swr";
import { KanbanColumn } from "../../../generated/prisma";

const fetcher = (url: string): Promise<KanbanColumn[]> =>
  fetch(url).then((r) => r.json());

export const useKanbanColumns = (defaultColumns?: KanbanColumn[]) => {
  const { data, error, isLoading, mutate } = useSWR<KanbanColumn[]>(
    "/api/kanban/columns",
    fetcher,
    { fallbackData: defaultColumns },
  );
  return { data, error, isLoading, mutate };
};
