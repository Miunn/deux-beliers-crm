import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function VoucherFormSection({
	title,
	children,
	className,
}: {
	title: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<fieldset className={cn("min-w-0 space-y-2 rounded-lg border px-3 py-2", className)}>
			<legend className="px-1 text-sm font-semibold">{title}</legend>
			{children}
		</fieldset>
	);
}
