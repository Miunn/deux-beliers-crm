import useSWR from "swr";
import { useMemo } from "react";
import { Event, Nature, Contact } from "../../generated/prisma";

export type EventWithNature = Event & { nature: Nature | null };

const fetcher = (
  url: string,
): Promise<{ contact: Contact; events: EventWithNature[] }> =>
  fetch(url).then((r) => r.json());

export const useEventsByContact = (contactId: string | null | undefined) => {
  const key = contactId ? `/api/contacts/${contactId}/events` : null;
  const { data, error, isLoading, mutate } = useSWR<{
    contact: Contact;
    events: EventWithNature[];
  }>(key, fetcher);
  return { data, error, isLoading, mutate };
};

export type EventWithRelations = Event & {
  nature: Nature | null;
  contact: Contact;
};

const rangeFetcher = (url: string): Promise<EventWithRelations[]> =>
  fetch(url).then((r) => r.json());

export const useWeeklyEvents = (defaultEvents: EventWithRelations[]) => {
  const { start, end } = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    // Set to Monday
    const day = startOfWeek.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { start: startOfWeek, end: endOfWeek };
  }, []);

  const key = `/api/events?from=${start.toISOString()}&to=${end.toISOString()}`;
  const { data, error, isLoading, mutate } = useSWR<EventWithRelations[]>(
    key,
    rangeFetcher,
    {
      fallbackData: defaultEvents,
      //   revalidateOnMount: defaultEvents === undefined,
    },
  );
  return { data, error, isLoading, mutate, start, end };
};
