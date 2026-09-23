"use client";

import { useEffect, useMemo, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	SearchIcon,
} from "lucide-react";
import { useVoucherProducts, useVouchers } from "@/hooks/use-vouchers";
import type { Voucher, VoucherStatus } from "@/types/voucher-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableStatusRow } from "@/components/ui/table-status-row";
import { cn } from "@/lib/utils";
import CreateVoucherDialog from "./CreateVoucherDialog";
import EditVoucherDialog from "./EditVoucherDialog";
import ResendVoucherDialog from "./ResendVoucherDialog";
import VoucherActionDialog from "./VoucherActionDialog";

const STATUS_OPTIONS: { value: VoucherStatus | "all"; label: string }[] = [
	{ value: "all", label: "Tous les statuts" },
	{ value: "sent", label: "Non utilisé" },
	{ value: "booked", label: "Réservé" },
	{ value: "redeemed", label: "Utilisé" },
	{ value: "expired", label: "Expiré" },
	{ value: "cancelled", label: "Annulé" },
];

function formatDateTime(value: string | null) {
	if (!value) return "—";
	const date = new Date(value.replace(" ", "T"));
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date);
}

function statusBadgeClassName(status: VoucherStatus) {
	switch (status) {
		case "sent":
			return "border-transparent bg-secondary text-secondary-foreground";
		case "booked":
			return "border-transparent bg-amber-600/15 text-amber-700 dark:text-amber-400";
		case "redeemed":
			return "border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400";
		case "expired":
			return "border-transparent bg-muted text-muted-foreground";
		case "cancelled":
			return "border-transparent bg-destructive/15 text-destructive";
	}
}

export default function VouchersContent() {
	const [status, setStatus] = useState<VoucherStatus | "all">("all");
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(20);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 300);
		return () => window.clearTimeout(timer);
	}, [searchInput]);

	const { vouchers, total, totalPages, error, isLoading, mutate } = useVouchers({
		status: status === "all" ? "" : status,
		search,
		page,
		per_page: perPage,
	});
	const { products, error: productsError, isLoading: productsLoading } = useVoucherProducts();
	const productNames = useMemo(() => new Map(products.map((product) => [product.id, product.name])), [products]);

	const handleStatusChange = (value: string) => {
		setStatus(value as VoucherStatus | "all");
		setPage(1);
	};

	const handlePerPageChange = (value: string) => {
		setPerPage(Number(value));
		setPage(1);
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Bons de visite brasserie ({total} bon{total > 1 ? "s" : ""}), créés via WooCommerce ou manuellement.
			</p>

			<div className="flex items-center gap-3">
				<div className="relative min-w-[200px] max-w-xs flex-1">
					<Input
						className="ps-9"
						placeholder="Code, e-mail ou n° commande"
						type="search"
						value={searchInput}
						onChange={(event) => setSearchInput(event.target.value)}
					/>
					<div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
						<SearchIcon className="size-4" />
					</div>
				</div>

				<Select value={status} onValueChange={handleStatusChange}>
					<SelectTrigger className="w-[180px] shrink-0">
						<SelectValue placeholder="Statut" />
					</SelectTrigger>
					<SelectContent>
						{STATUS_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="ms-auto shrink-0">
					<CreateVoucherDialog
						onCreated={() => {
							setPage(1);
							void mutate();
						}}
					/>
				</div>
			</div>

			{error ? <p className="text-sm text-destructive">{error.message}</p> : null}
			{productsError ? <p className="text-sm text-destructive">{productsError.message}</p> : null}

			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Code</TableHead>
							<TableHead>Statut</TableHead>
							<TableHead>Destinataire</TableHead>
							<TableHead>Acheteur</TableHead>
							<TableHead>Produit</TableHead>
							<TableHead>Créé le</TableHead>
							<TableHead>Expire le</TableHead>
							<TableHead>Utilisé le</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody key={`${status}-${search}-${page}-${perPage}`}>
						{vouchers && vouchers.length > 0 ? (
							vouchers.map((voucher) => (
								<VoucherRow
									key={voucher.id}
									voucher={voucher}
									productLabel={productLabel(voucher.product_id, productNames, productsLoading)}
									onUpdated={() => void mutate()}
								/>
							))
						) : (
							<TableStatusRow colSpan={9} isLoading={isLoading} emptyMessage="Aucun bon trouvé" />
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-4 px-1">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium">Par page</p>
					<Select value={String(perPage)} onValueChange={handlePerPageChange}>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent side="top">
							{[20, 50, 100].map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-4">
					<p className="text-sm font-medium">
						Page {page} sur {totalPages}
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="hidden size-8 lg:flex"
							onClick={() => setPage(1)}
							disabled={page <= 1 || isLoading}
						>
							<ChevronsLeft />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							onClick={() => setPage((current) => Math.max(1, current - 1))}
							disabled={page <= 1 || isLoading}
						>
							<ChevronLeft />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
							disabled={page >= totalPages || isLoading}
						>
							<ChevronRight />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="hidden size-8 lg:flex"
							onClick={() => setPage(totalPages)}
							disabled={page >= totalPages || isLoading}
						>
							<ChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function productLabel(productId: number, productNames: Map<number, string>, productsLoading: boolean) {
	if (productId <= 0) return "—";
	const name = productNames.get(productId);
	if (name) return name;
	if (productsLoading) return "—";
	return `Produit #${productId}`;
}

function VoucherRow({
	voucher,
	productLabel,
	onUpdated,
}: {
	voucher: Voucher;
	productLabel: string;
	onUpdated?: () => void;
}) {
	return (
		<TableRow>
			<TableCell className="font-mono font-medium">{voucher.code}</TableCell>
			<TableCell>
				<Badge className={cn(statusBadgeClassName(voucher.status))}>{voucher.status_label}</Badge>
			</TableCell>
			<TableCell>
				<div className="min-w-0">
					<p className="truncate">{voucher.recipient_name || "—"}</p>
					<p className="truncate text-xs text-muted-foreground">{voucher.recipient_email}</p>
				</div>
			</TableCell>
			<TableCell className="max-w-[200px] truncate">{voucher.buyer_email || "—"}</TableCell>
			<TableCell className="max-w-[220px] truncate">{productLabel}</TableCell>
			<TableCell className="whitespace-nowrap text-sm">{formatDateTime(voucher.created_at)}</TableCell>
			<TableCell className="whitespace-nowrap text-sm">{formatDateTime(voucher.expires_at)}</TableCell>
			<TableCell className="whitespace-nowrap text-sm">{formatDateTime(voucher.redeemed_at)}</TableCell>
			<TableCell className="text-right">
				<div className="flex items-center justify-end gap-0.5">
					<EditVoucherDialog voucher={voucher} onUpdated={onUpdated} />
					<ResendVoucherDialog voucher={voucher} onSent={onUpdated} />
					<VoucherActionDialog voucher={voucher} action="book" onDone={onUpdated} />
					<VoucherActionDialog voucher={voucher} action="redeem" onDone={onUpdated} />
				</div>
			</TableCell>
		</TableRow>
	);
}
