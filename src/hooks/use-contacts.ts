"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activite, Contact, Label } from "../../generated/prisma";
import { useSearchParams } from "next/navigation";

export type ContactWithRelations = Contact & {
  labels: Label[];
  activite: Activite | null;
  events?: Array<{
    id: string;
    date: Date | string;
    nature?: { id: string; label: string } | null;
    attendus?: string | null;
    resultat?: string | null;
  }>;
};

type ContactsApi = {
  contacts: ContactWithRelations[];
  setContacts: (
    updater:
      | ContactWithRelations[]
      | ((prev: ContactWithRelations[]) => ContactWithRelations[])
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
        | ((prev: ContactWithRelations[]) => ContactWithRelations[])
    ) => {
      const prevCurrent = contactsStoreRef?.current ?? [];
      const next =
        typeof updater === "function"
          ? (
              updater as (
                prev: ContactWithRelations[]
              ) => ContactWithRelations[]
            )(prevCurrent)
          : updater;
      if (!contactsStoreRef) contactsStoreRef = { current: next };
      else contactsStoreRef.current = next;
      setVersion((v) => v + 1);
      notifySubscribers();
    },
    []
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
    [setContacts]
  );

  const removeContact = useCallback<ContactsApi["removeContact"]>(
    (id) => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    },
    [setContacts]
  );

  const setContactLabels = useCallback<ContactsApi["setContactLabels"]>(
    (id, labels) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, labels } : c))
      );
    },
    [setContacts]
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
            : c
        )
      );
    },
    [setContacts]
  );

  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const labelId = searchParams.get("labelId") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const selectedLabelIds = useMemo(
    () =>
      labelId && labelId !== "all" ? labelId.split(",").filter(Boolean) : [],
    [labelId]
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
            e?.attendus ?? "",
            e?.resultat ?? "",
          ])
        : [];
      const all = haystacks.concat(eventStrings).join("\n").toLowerCase();
      return all.includes(q);
    };

    const matchesLabels = (c: ContactWithRelations): boolean => {
      if (!selectedLabelIds.length) return true;
      const set = new Set(c.labels.map((l) => l.id));
      // require ALL selected labels to be present
      return selectedLabelIds.every((id) => set.has(id));
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
      (c) => matchesText(c) && matchesLabels(c) && matchesDates(c)
    );
  }, [allContacts, q, selectedLabelIds, fromDate, toDate]);

  return {
    contacts,
    allContacts,
    addOrUpdateContact,
    removeContact,
    setContactLabels,
    appendEventDate,
  };
}
