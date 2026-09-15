import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

export function TableStatusRow({
	colSpan,
	isLoading,
	emptyMessage,
}: {
	colSpan: number;
	isLoading?: boolean;
	emptyMessage: string;
}) {
	return (
		<TableRow>
			<TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
				{isLoading ? (
					<span className="inline-flex items-center gap-2">
						<Loader2 className="size-4 animate-spin" />
						Chargement…
					</span>
				) : (
					emptyMessage
				)}
			</TableCell>
		</TableRow>
	);
}
