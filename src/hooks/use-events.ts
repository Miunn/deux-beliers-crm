import useSWR from "swr";
import { Event, Nature, Contact } from "../../generated/prisma";

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

type EventWithRelations = Event & { nature: Nature | null; contact: Contact };

const rangeFetcher = (url: string): Promise<EventWithRelations[]> =>
  fetch(url).then((r) => r.json());

export const useWeeklyEvents = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  // Set to Monday
  const day = start.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
  start.setDate(start.getDate() + diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const key = `/api/events`;
  const { data, error, isLoading, mutate } = useSWR<EventWithRelations[]>(
    key,
    (url: string) =>
      rangeFetcher(url + `?from=${start.toISOString()}&to=${end.toISOString()}`)
  );
  return { data, error, isLoading, mutate, start, end };
};
