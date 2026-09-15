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

	return (
		<Select value={String(value)} onValueChange={(next) => onChange(Number(next))}>
			<FormControl>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Aucun" />
				</SelectTrigger>
			</FormControl>
			<SelectContent>
				<SelectItem value="0">Aucun</SelectItem>
				{products.map((product) => (
					<SelectItem key={product.id} value={String(product.id)}>
						{product.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
