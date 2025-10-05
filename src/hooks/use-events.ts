import useSWR from "swr";
import { Event } from "../../generated/prisma";

const fetcher = (url: string): Promise<Event[]> =>
  fetch(url).then((r) => r.json());

export const useEventsByContact = (contactId: string | null | undefined) => {
  const key = contactId ? `/api/contacts/${contactId}/events` : null;
  const { data, error, isLoading, mutate } = useSWR<Event[]>(key, fetcher);
  return { data, error, isLoading, mutate };
};
