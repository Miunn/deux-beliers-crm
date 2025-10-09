"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Activite, Contact, Label } from "../../generated/prisma";
import { DateRange } from "react-day-picker";

export type ContactEventLite = {
  id: string;
  date: Date | string;
  nature?: { id: string; label: string } | null;
  attendus?: string | null;
  resultat?: string | null;
};

export type ContactWithRelations = Contact & {
  labels: Label[];
  activite: Activite | null;
  events?: ContactEventLite[];
};

type ContactsContextValue = {
  // data
  allContacts: ContactWithRelations[];
  contacts: ContactWithRelations[];
  // filters
  text: string;
  selectedLabelIds: string[];
  dateRange: DateRange | undefined;
  setText: (text: string) => void;
  setSelectedLabelIds: (ids: string[]) => void;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  resetFilters: () => void;
  // mutations
  addOrUpdateContact: (contact: ContactWithRelations) => void;
  removeContact: (id: string) => void;
  setContactLabels: (id: string, labels: Label[]) => void;
  appendEventDate: (contactId: string, date: Date | string) => void;
};

const ContactsContext = createContext<ContactsContextValue | undefined>(
  undefined
);

export function ContactsProvider({
  children,
  defaultContacts,
}: {
  children: React.ReactNode;
  defaultContacts: ContactWithRelations[];
}) {
  const [allContacts, setAllContacts] = useState<ContactWithRelations[]>(
    defaultContacts ?? []
  );

  const [text, setText] = useState<string>("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const resetFilters = useCallback(() => {
    setText("");
    setSelectedLabelIds([]);
    setDateRange(undefined);
  }, []);

  const addOrUpdateContact = useCallback((contact: ContactWithRelations) => {
    setAllContacts((prev) => {
      const index = prev.findIndex((c) => c.id === contact.id);
      if (index === -1) return [contact, ...prev];
      const next = prev.slice();
      next[index] = { ...prev[index], ...contact };
      return next;
    });
  }, []);

  const removeContact = useCallback((id: string) => {
    setAllContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setContactLabels = useCallback((id: string, labels: Label[]) => {
    setAllContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, labels } : c))
    );
  }, []);

  const appendEventDate = useCallback(
    (contactId: string, date: Date | string) => {
      setAllContacts((prev) =>
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
    []
  );

  const contacts = useMemo(() => {
    const items = allContacts;
    if (!items || items.length === 0) return items;

    const q = text.trim().toLowerCase();
    const fromDate = dateRange?.from;
    const toDate = dateRange?.to;

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
  }, [allContacts, text, selectedLabelIds, dateRange]);

  const value: ContactsContextValue = useMemo(
    () => ({
      allContacts,
      contacts,
      text,
      selectedLabelIds,
      dateRange,
      setText,
      setSelectedLabelIds,
      setDateRange,
      resetFilters,
      addOrUpdateContact,
      removeContact,
      setContactLabels,
      appendEventDate,
    }),
    [
      allContacts,
      contacts,
      text,
      selectedLabelIds,
      dateRange,
      setText,
      setSelectedLabelIds,
      setDateRange,
      resetFilters,
      addOrUpdateContact,
      removeContact,
      setContactLabels,
      appendEventDate,
    ]
  );

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContactsContext(): ContactsContextValue {
  const ctx = useContext(ContactsContext);
  if (!ctx) {
    throw new Error("useContactsContext must be used within ContactsProvider");
  }
  return ctx;
}
