"use client";

import { Loader2, CalendarDays } from "lucide-react";
import { useWeeklyEvents } from "@/hooks/use-events";
import EventCard from "./EventCard";

export default function WeeklyEvents() {
  const { data: events, isLoading, error, start, end } = useWeeklyEvents();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4" />
        <h3 className="text-lg font-medium">
          Semaine: {start.toLocaleDateString()} → {end.toLocaleDateString()}
        </h3>
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Chargement des événements…
        </div>
      )}
      {error && <div className="text-sm text-destructive">{error.message}</div>}
      {!isLoading && !error && (
        <div className="w-full flex gap-2 flex-wrap divide-y">
          {events && events.length > 0 ? (
            events.map((e) => <EventCard key={e.id} e={e} />)
          ) : (
            <div className="p-3 text-sm text-muted-foreground">
              Aucun événement cette semaine.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
