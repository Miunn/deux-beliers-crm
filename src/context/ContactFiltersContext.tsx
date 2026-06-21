"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { DateRange } from "react-day-picker";
import { SelectedState } from "@/components/ui/multi-select";
import { ContactSortMethod } from "@/types/contact-types";

type ContactFiltersContextValue = {
	text: string;
	selectedLabels: SelectedState[];
	hasReminder: boolean;
	dateRange: DateRange | undefined;
	sortState: ContactSortMethod;
	setText: (text: string) => void;
	setSelectedLabels: (ids: SelectedState[]) => void;
	setHasReminder: (has: boolean) => void;
	setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
	setSortState: React.Dispatch<React.SetStateAction<ContactSortMethod>>;
	resetFilters: () => void;
};

const ContactFiltersContext = createContext<ContactFiltersContextValue | undefined>(
	undefined,
);

export function ContactFiltersProvider({ children }: { children: React.ReactNode }) {
	const [text, setText] = useState("");
	const [hasReminder, setHasReminder] = useState(false);
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

	const value = useMemo(
		() => ({
			text,
			selectedLabels,
			hasReminder,
			dateRange,
			sortState,
			setText,
			setSelectedLabels,
			setHasReminder,
			setDateRange,
			setSortState,
			resetFilters,
		}),
		[text, selectedLabels, hasReminder, dateRange, sortState, resetFilters],
	);

	return (
		<ContactFiltersContext.Provider value={value}>
			{children}
		</ContactFiltersContext.Provider>
	);
}

export function useContactFilters() {
	const ctx = useContext(ContactFiltersContext);
	if (!ctx) {
		throw new Error("useContactFilters must be used within ContactFiltersProvider");
	}
	return ctx;
}
