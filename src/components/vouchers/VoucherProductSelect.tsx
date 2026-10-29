"use client";

import { Loader2 } from "lucide-react";
import { FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VoucherProduct } from "@/types/voucher-types";

export default function VoucherProductSelect({
	value,
	onChange,
	products,
	isLoading,
}: {
	value: number;
	onChange: (value: number) => void;
	products: VoucherProduct[];
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<div
				className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-sm text-muted-foreground shadow-xs"
				aria-live="polite"
				aria-busy="true"
			>
				<Loader2 className="size-4 shrink-0 animate-spin" />
				Chargement des produits…
			</div>
		);
	}

	const selectedName = products.find((product) => product.id === value)?.name;

	return (
		<Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
			<FormControl>
				<SelectTrigger
					title={selectedName}
					className="w-full min-w-0 overflow-hidden *:data-[slot=select-value]:block! *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate"
				>
					<SelectValue placeholder="Aucun" />
				</SelectTrigger>
			</FormControl>
			<SelectContent
				align="start"
				className="w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)"
			>
				<SelectItem value="0">Aucun</SelectItem>
				{products.map((product) => (
					<SelectItem
						key={product.id}
						value={String(product.id)}
						title={product.name}
						className="[&>span:first-child]:min-w-0 [&>span:first-child]:truncate"
					>
						{product.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
