"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activite, Contact, Label } from "../../generated/prisma";
import { useSearchParams } from "next/navigation";
import { SelectedState } from "@/components/ui/multi-select";

export type ContactWithRelations = Contact & {
  labels: Label[];
  activite: Activite | null;
  events?: Array<{
    id: string;
    date: Date | string;
    nature?: { id: string; label: string } | null;
    commentaires?: string | null;
  }>;
};

type ContactsApi = {
  contacts: ContactWithRelations[];
  setContacts: (
    updater:
      | ContactWithRelations[]
      | ((prev: ContactWithRelations[]) => ContactWithRelations[]),
  ) => void;
  addOrUpdateContact: (contact: ContactWithRelations) => void;
  removeContact: (id: string) => void;
  setContactLabels: (id: string, labels: Label[]) => void;
  appendEventDate: (contactId: string, date: Date | string) => void;
};

// local singleton store per module instance; sufficient for the page lifecycle
let contactsStoreRef: { current: ContactWithRelations[] } | null = null;
const subscribers = new Set<() => void>();
const notifySubscribers = () => {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
};

export function useContacts(defaultContacts: ContactWithRelations[]): {
  contacts: ContactWithRelations[];
  allContacts: ContactWithRelations[];
  addOrUpdateContact: (contact: ContactWithRelations) => void;
  removeContact: (id: string) => void;
  setContactLabels: (id: string, labels: Label[]) => void;
  appendEventDate: (contactId: string, date: Date | string) => void;
} {
  // initialize local store once
  useState(() => {
    if (!contactsStoreRef && defaultContacts && defaultContacts.length > 0) {
      contactsStoreRef = { current: defaultContacts };
    }
    return 0;
  });
  // force rerender on updates
  const [, setVersion] = useState(0);

  // subscribe to global store updates
  useEffect(() => {
    const cb = () => setVersion((v) => v + 1);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  const setContacts = useCallback(
    (
      updater:
        | ContactWithRelations[]
        | ((prev: ContactWithRelations[]) => ContactWithRelations[]),
    ) => {
      const prevCurrent = contactsStoreRef?.current ?? [];
      const next =
        typeof updater === "function"
          ? (
              updater as (
                prev: ContactWithRelations[],
              ) => ContactWithRelations[]
            )(prevCurrent)
          : updater;
      if (!contactsStoreRef) contactsStoreRef = { current: next };
      else contactsStoreRef.current = next;
      setVersion((v) => v + 1);
      notifySubscribers();
    },
    [],
  );

  const addOrUpdateContact = useCallback<ContactsApi["addOrUpdateContact"]>(
    (contact) => {
      setContacts((prev) => {
        const index = prev.findIndex((c) => c.id === contact.id);
        if (index === -1) return [contact, ...prev];
        const next = prev.slice();
        next[index] = { ...prev[index], ...contact };
        return next;
      });
    },
    [setContacts],
  );

  const removeContact = useCallback<ContactsApi["removeContact"]>(
    (id) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    },
    [setContacts],
  );

  const setContactLabels = useCallback<ContactsApi["setContactLabels"]>(
    (id, labels) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, labels } : c)),
      );
    },
    [setContacts],
  );

  const appendEventDate = useCallback<ContactsApi["appendEventDate"]>(
    (contactId, date) => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? {
                ...c,
                events: [
                  {
                    id: `temp-${Date.now()}`,
                    date,
                    attendus: null,
                    resultat: null,
                  },
                  ...(c.events ?? []),
                ],
              }
            : c,
        ),
      );
    },
    [setContacts],
  );

  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const labels = searchParams.get("labelId") ?? "[]";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const selectedLabels = useMemo(
    () => (labels && labels !== "all" ? JSON.parse(labels) : []),
    [labels],
  );

  const fromDate = useMemo(() => (from ? new Date(from) : undefined), [from]);
  const toDate = useMemo(() => (to ? new Date(to) : undefined), [to]);

  const allContacts = contactsStoreRef?.current ?? defaultContacts;

  const contacts = useMemo(() => {
    const items = allContacts;
    if (!items || items.length === 0) return items;

    const matchesText = (c: ContactWithRelations): boolean => {
      if (!q) return true;
      const haystacks: string[] = [
        c.nom ?? "",
        c.ville ?? "",
        c.contact ?? "",
        c.telephone ?? "",
        c.mail ?? "",
        c.observations ?? "",
        String(c.adresse ?? ""),
        String(c.horaires ?? ""),
        c.activite?.label ?? "",
        ...c.labels.map((l) => l.label ?? ""),
      ];
      const eventStrings: string[] = c.events
        ? c.events.flatMap((e) => [
            e?.nature?.label ?? "",
            e?.commentaires ?? "",
          ])
        : [];
      const all = haystacks.concat(eventStrings).join("\n").toLowerCase();
      return all.includes(q);
    };

    const matchesLabels = (c: ContactWithRelations): boolean => {
      if (selectedLabels.length === 0) return true;
      const set = new Set(c.labels.map((l) => l.id));

      // If contact labels containts any of exclude labels, return false
      // Otherwise, contact must contain all of "and" labels
      // And at least one of "or" labels
      const excludeLabels = selectedLabels.filter(
        (l: SelectedState) => l.action === "exclude",
      );
      for (const l of excludeLabels) {
        if (set.has(l.id)) return false;
      }
      const andLabels = selectedLabels.filter(
        (l: SelectedState) => l.action === "and",
      );
      for (const l of andLabels) {
        if (!set.has(l.id)) return false;
      }
      const orLabels = selectedLabels.filter(
        (l: SelectedState) => l.action === "or",
      );
      if (orLabels.length > 0) {
        let hasOne = false;
        for (const l of orLabels) {
          if (set.has(l.id)) {
            hasOne = true;
            break;
          }
        }
        if (!hasOne) return false;
      }
      return true;
    };

    const matchesDates = (c: ContactWithRelations): boolean => {
      if (!fromDate && !toDate) return true;
      const events = c.events ?? [];
      return events.some((e) => {
        const d = e?.date ? new Date(e.date) : undefined;
        if (!d) return false;
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        return true;
      });
    };

    return items.filter(
      (c) => matchesText(c) && matchesLabels(c) && matchesDates(c),
    );
  }, [allContacts, q, selectedLabels, fromDate, toDate]);

  return {
    contacts,
    allContacts,
    addOrUpdateContact,
    removeContact,
    setContactLabels,
    appendEventDate,
  };
}
