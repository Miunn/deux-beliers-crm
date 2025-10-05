import useSWR from "swr";
import { Nature } from "../../generated/prisma";

const fetcher = (url: string): Promise<Nature[]> =>
  fetch(url).then((r) => r.json());

export const useNatures = () => {
  const { data, error, isLoading, mutate } = useSWR<Nature[]>(
    "/api/natures",
    fetcher
  );
  return { data, error, isLoading, mutate };
};
