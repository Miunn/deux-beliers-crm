import useSWR from "swr";
import { Event, Nature } from "../../generated/prisma";

type EventWithNature = Event & { nature: Nature | null };

const fetcher = (url: string): Promise<EventWithNature[]> =>
  fetch(url).then((r) => r.json());

export const useEventsByContact = (contactId: string | null | undefined) => {
  const key = contactId ? `/api/contacts/${contactId}/events` : null;
  const { data, error, isLoading, mutate } = useSWR<EventWithNature[]>(
    key,
    fetcher
  );
  return { data, error, isLoading, mutate };
};
