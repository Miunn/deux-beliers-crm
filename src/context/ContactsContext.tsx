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
import { ContactSortMethod } from "@/components/common/SortByDropdown";
import { SelectedState } from "@/components/ui/multi-select";

export type ContactEventLite = {
  id: string;
  date: Date | string;
  nature?: { id: string; label: string } | null;
  commentaires?: string | null;
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
  selectedLabels: SelectedState[];
  hasReminder: boolean;
  dateRange: DateRange | undefined;
  setText: (text: string) => void;
  setSelectedLabels: (ids: SelectedState[]) => void;
  setHasReminder: (has: boolean) => void;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  resetFilters: () => void;
  // mutations
  addOrUpdateContact: (
    contact: Partial<ContactWithRelations> | ContactWithRelations,
  ) => void;
  removeContact: (id: string) => void;
  setContactLabels: (id: string, labels: Label[]) => void;
  appendEventDate: (contactId: string, date: Date | string) => void;
  sortState: ContactSortMethod;
  setSortState: React.Dispatch<React.SetStateAction<ContactSortMethod>>;
};

const ContactsContext = createContext<ContactsContextValue | undefined>(
  undefined,
);

export function ContactsProvider({
  children,
  defaultContacts,
}: {
  children: React.ReactNode;
  defaultContacts: ContactWithRelations[];
}) {
  const [allContacts, setAllContacts] = useState<ContactWithRelations[]>(
    defaultContacts ?? [],
  );

  const [text, setText] = useState<string>("");
  const [hasReminder, setHasReminder] = useState<boolean>(false);
  const [selectedLabels, setSelectedLabels] = useState<SelectedState[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortState, setSortState] = useState<ContactSortMethod>(
    ContactSortMethod.RappelAsc,
  );

  const resetFilters = useCallback(() => {
    setText("");
    setSelectedLabels([]);
    setDateRange(undefined);
  }, []);

  const addOrUpdateContact = useCallback(
    (contact: Partial<ContactWithRelations> | ContactWithRelations) => {
      setAllContacts((prev) => {
        const index = prev.findIndex((c) => c.id === contact.id);
        if (index === -1) {
          // Check if contact has all required fields to be added
          if (
            !("nom" in contact) ||
            !("labels" in contact) ||
            !("activite" in contact) ||
            !("events" in contact)
          ) {
            console.log(
              "Cannot add contact, missing required fields:",
              contact,
            );
            return prev;
          }
          return [...prev, contact as ContactWithRelations];
        }
        const next = prev.slice();
        next[index] = { ...prev[index], ...contact } as ContactWithRelations;
        return next;
      });
    },
    [],
  );

  const removeContact = useCallback((id: string) => {
    setAllContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setContactLabels = useCallback((id: string, labels: Label[]) => {
    setAllContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, labels } : c)),
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
            : c,
        ),
      );
    },
    [],
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
            e?.commentaires ?? "",
          ])
        : [];
      const all = haystacks.concat(eventStrings).join("\n").toLowerCase();
      return all.includes(q);
    };

    const matchesReminder = (c: ContactWithRelations): boolean => {
      if (!hasReminder) return true;
      if (!c.rappel) return false;
      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);
      const rappelDate = new Date(c.rappel);
      return rappelDate <= in7Days;
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

    return items
      .filter(
        (c) =>
          matchesReminder(c) &&
          matchesLabels(c) &&
          matchesDates(c) &&
          matchesText(c),
      )
      .sort((a, b) => {
        switch (sortState) {
          case ContactSortMethod.RappelAsc: {
            const dateA = a.rappel ? new Date(a.rappel).getTime() : Infinity;
            const dateB = b.rappel ? new Date(b.rappel).getTime() : Infinity;
            return dateA - dateB;
          }
          case ContactSortMethod.RappelDesc: {
            const dateA = a.rappel ? new Date(a.rappel).getTime() : -Infinity;
            const dateB = b.rappel ? new Date(b.rappel).getTime() : -Infinity;
            return dateB - dateA;
          }
          case ContactSortMethod.NameAsc:
            return (a.nom ?? "").localeCompare(b.nom ?? "");
          case ContactSortMethod.NameDesc:
            return (b.nom ?? "").localeCompare(a.nom ?? "");
          default:
            return 0;
        }
      });
  }, [allContacts, text, hasReminder, selectedLabels, dateRange, sortState]);

  const value: ContactsContextValue = useMemo(
    () => ({
      allContacts,
      contacts,
      text,
      selectedLabels,
      hasReminder,
      dateRange,
      setText,
      setHasReminder,
      setSelectedLabels,
      setDateRange,
      resetFilters,
      addOrUpdateContact,
      removeContact,
      setContactLabels,
      appendEventDate,
      sortState,
      setSortState,
    }),
    [
      allContacts,
      contacts,
      text,
      selectedLabels,
      hasReminder,
      dateRange,
      setText,
      setHasReminder,
      setSelectedLabels,
      setDateRange,
      resetFilters,
      addOrUpdateContact,
      removeContact,
      setContactLabels,
      appendEventDate,
      sortState,
      setSortState,
    ],
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
