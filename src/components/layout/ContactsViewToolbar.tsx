"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, SearchIcon, XIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

import ContactDialog from "@/components/dialogs/ContactDialog";
import SortByDropdown from "@/components/common/SortByDropdown";
import EventDateRangeFilter from "@/components/table/EventDateRangeFilter";
import LabelsFilter from "@/components/table/LabelsFilter";
import ReminderWithinSevenDaysFilter from "@/components/table/ReminderWithinSevenDaysFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContactFilters } from "@/context/ContactFiltersContext";
import { useDerivedContacts } from "@/hooks/use-derived-contacts";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	showCreateButton?: boolean;
	trailing?: ReactNode;
};

export default function ContactsViewToolbar({
	className,
	showCreateButton = true,
	trailing,
}: Props) {
	const searchParams = useSearchParams();
	const { contacts } = useDerivedContacts();
	const {
		text,
		setText,
		hasReminder,
		setHasReminder,
		selectedLabels,
		setSelectedLabels,
		dateRange,
		setDateRange,
		sortState,
		setSortState,
		resetFilters,
	} = useContactFilters();

	const [localText, setLocalText] = useState(text ?? "");

	useEffect(() => {
		setLocalText(text ?? "");
	}, [text]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setText(localText);
		}, 250);

		return () => clearTimeout(timeout);
	}, [localText, setText]);

	useEffect(() => {
		const urlQ = searchParams.get("q") ?? "";
		const urlLabelIds = JSON.parse(searchParams.get("labelId") ?? "[]");

		if (urlQ && !text) {
			setText(urlQ);
			setLocalText(urlQ);
		}

		if (urlLabelIds.length && selectedLabels.length === 0) {
			setSelectedLabels(urlLabelIds.filter(Boolean));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const contactCount = contacts?.length ?? 0;
	const hasActiveFilters =
		Boolean(text.trim()) ||
		hasReminder ||
		selectedLabels.length > 0 ||
		Boolean(dateRange?.from || dateRange?.to);

	const handleClearFilters = () => {
		resetFilters();
		setHasReminder(false);
		setLocalText("");
	};

	return (
		<div className={cn("space-y-3 border-b pb-4", className)}>
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div className="relative w-full lg:max-w-sm">
					<Input
						className="ps-9"
						placeholder="Filtrer les contacts"
						type="search"
						value={localText}
						onChange={(event) => setLocalText(event.target.value)}
					/>
					<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
						<SearchIcon className="size-4" />
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{hasActiveFilters ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-muted-foreground"
							onClick={handleClearFilters}
						>
							<XIcon className="size-4" />
							Effacer
						</Button>
					) : null}
					<ReminderWithinSevenDaysFilter
						checked={hasReminder}
						onCheckedChange={setHasReminder}
					/>
					<EventDateRangeFilter value={dateRange} onChange={setDateRange} />
					<LabelsFilter value={selectedLabels} onChange={setSelectedLabels} />
					<SortByDropdown sortState={sortState} setSortState={setSortState} />
					{trailing}
					{showCreateButton ? (
						<ContactDialog mode="create">
							<Button variant="outline" size="sm">
								<Plus className="size-4" />
								Créer un contact
							</Button>
						</ContactDialog>
					) : null}
				</div>
			</div>

			<p className="text-sm text-muted-foreground">
				{contactCount === 0 ? "Aucun contact" : `${contactCount} contact${contactCount > 1 ? "s" : ""}`}
			</p>
		</div>
	);
}
