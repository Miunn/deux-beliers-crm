"use client";

import { Loader2, CalendarDays } from "lucide-react";
import { EventWithRelations, useWeeklyEvents } from "@/hooks/use-events";
import EventCard from "./EventCard";

export default function WeeklyEvents({
  defaultEvents,
}: {
  defaultEvents: EventWithRelations[];
}) {
  const {
    data: events,
    isLoading,
    error,
    start,
    end,
  } = useWeeklyEvents(defaultEvents);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4" />
        <h3 className="text-lg font-medium">
          Semaine: {start.toLocaleDateString()} → {end.toLocaleDateString()}
        </h3>
      </div>
      {isLoading && events?.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Chargement des événements…
        </div>
      )}
      {!isLoading && !error && events?.length === 0 && (
        <div className="p-3 text-sm text-muted-foreground">
          Aucun événement cette semaine.
        </div>
      )}
      {error && <div className="text-sm text-destructive">{error.message}</div>}
      {!isLoading && !error && events && events.length > 0 && (
        <div className="w-full flex gap-2 flex-wrap divide-y">
          {events.map((e) => (
            <EventCard key={e.id} e={e} />
          ))}
        </div>
      )}
    </div>
  );
}
