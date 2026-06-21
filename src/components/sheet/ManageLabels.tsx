"use client";

import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "../ui/sheet";
import ManageLabelsContent from "../labels/ManageLabelsContent";

export default function ManageLabelsSheet({
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
					<SheetTitle>Gérer les libellés</SheetTitle>
				</SheetHeader>

				<div className="p-4 h-full">
					<ManageLabelsContent />
				</div>

				<SheetFooter />
			</SheetContent>
		</Sheet>
	);
}
