import useSWR from "swr";
import { Label } from "../../generated/prisma/client";

const fetcher = (url: string): Promise<Label[]> =>
  fetch(url).then((r) => r.json());

export const useLabels = () => {
  const { data, error, isLoading, mutate } = useSWR<Label[]>(
    "/api/labels",
    fetcher
  );
  return { data, error, isLoading, mutate };
};
