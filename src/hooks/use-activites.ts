import useSWR from "swr";
import { Activite } from "../../generated/prisma";

const fetcher = (url: string): Promise<Activite[]> =>
  fetch(url).then((res) => res.json());

export const useActivites = () => {
  const { data, error, isLoading } = useSWR<Activite[]>(
    "/api/activites",
    fetcher
  );
  return { data, error, isLoading };
};
