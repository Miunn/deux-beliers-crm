"use client";

import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "../ui/sheet";
import ManageNaturesContent from "../natures/ManageNaturesContent";

export default function ManageNaturesSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Gérer les natures d&apos;événement</SheetTitle>
				</SheetHeader>

				<div className="p-4 h-full">
					<ManageNaturesContent />
				</div>

				<SheetFooter />
			</SheetContent>
		</Sheet>
	);
}
