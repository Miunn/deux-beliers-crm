"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useVoucherProducts } from "@/hooks/use-vouchers";
import type { UpdateVoucherResponse, Voucher, VoucherStatus } from "@/types/voucher-types";
import VoucherProductSelect from "./VoucherProductSelect";

const STATUS_OPTIONS: { value: VoucherStatus; label: string }[] = [
	{ value: "sent", label: "Non utilisé" },
	{ value: "booked", label: "Réservé" },
	{ value: "redeemed", label: "Utilisé" },
	{ value: "expired", label: "Expiré" },
	{ value: "cancelled", label: "Annulé" },
];

const EDIT_VOUCHER_FORM_SCHEMA = z.object({
	recipient_email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
	recipient_name: z.string(),
	code: z.string().min(1, "Code requis"),
	product_id: z.number().int().min(0, "ID produit invalide"),
	buyer_email: z.union([z.literal(""), z.string().email("Adresse e-mail invalide")]),
	message: z.string(),
	status: z.enum(["sent", "booked", "redeemed", "expired", "cancelled"]),
	expires_at: z.string(),
	order_id: z.number().int().min(0),
	order_item_id: z.number().int().min(0),
});

type EditVoucherFormValues = z.infer<typeof EDIT_VOUCHER_FORM_SCHEMA>;

function toDatetimeLocal(value: string | null): string {
	if (!value) return "";
	return value.replace(" ", "T").slice(0, 16);
}

function fromDatetimeLocal(value: string): string | null {
	if (!value) return null;
	return value.includes(" ") ? value : `${value.replace("T", " ")}:00`;
}

function valuesFromVoucher(voucher: Voucher): EditVoucherFormValues {
	return {
		recipient_email: voucher.recipient_email,
		recipient_name: voucher.recipient_name ?? "",
		code: voucher.code,
		product_id: voucher.product_id,
		buyer_email: voucher.buyer_email ?? "",
		message: voucher.message ?? "",
		status: voucher.status,
		expires_at: toDatetimeLocal(voucher.expires_at),
		order_id: voucher.order_id,
		order_item_id: voucher.order_item_id,
	};
}

function buildUpdatePayload(values: EditVoucherFormValues, voucher: Voucher) {
	const nextExpiresAt = fromDatetimeLocal(values.expires_at);
	const currentExpiresAt = voucher.expires_at ? voucher.expires_at.slice(0, 19) : null;
	const payload: Record<string, unknown> = {};

	if (values.recipient_email !== voucher.recipient_email) payload.recipient_email = values.recipient_email;
	if (values.recipient_name !== (voucher.recipient_name ?? "")) payload.recipient_name = values.recipient_name;
	if (values.code !== voucher.code) payload.code = values.code;
	if (values.product_id !== voucher.product_id) payload.product_id = values.product_id;
	if (values.buyer_email !== (voucher.buyer_email ?? "")) payload.buyer_email = values.buyer_email;
	if (values.message !== (voucher.message ?? "")) payload.message = values.message;
	if (values.status !== voucher.status) payload.status = values.status;
	if (nextExpiresAt !== currentExpiresAt) payload.expires_at = nextExpiresAt;
	if (values.order_id !== voucher.order_id) payload.order_id = values.order_id;
	if (values.order_item_id !== voucher.order_item_id) payload.order_item_id = values.order_item_id;

	return payload;
}

export default function EditVoucherDialog({ voucher, onUpdated }: { voucher: Voucher; onUpdated?: () => void }) {
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { products, error: productsError, isLoading: productsLoading } = useVoucherProducts(open);

	const form = useForm<EditVoucherFormValues>({
		resolver: zodResolver(EDIT_VOUCHER_FORM_SCHEMA),
		defaultValues: valuesFromVoucher(voucher),
	});

	useEffect(() => {
		if (open) form.reset(valuesFromVoucher(voucher));
	}, [form, open, voucher]);

	const productOptions = useMemo(() => {
		if (voucher.product_id === 0 || products.some((product) => product.id === voucher.product_id)) {
			return products;
		}
		return [{ id: voucher.product_id, name: `Produit #${voucher.product_id}` }, ...products];
	}, [products, voucher.product_id]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!submitting) setOpen(nextOpen);
	};

	const onSubmit = async (values: EditVoucherFormValues) => {
		const payload = buildUpdatePayload(values, voucher);
		if (Object.keys(payload).length === 0) {
			toast.message("Aucune modification");
			setOpen(false);
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch(`/api/vouchers/${voucher.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const body = (await res.json()) as UpdateVoucherResponse & { error?: string };

			if (!res.ok) {
				toast.error(body.error ?? "Impossible de mettre à jour le bon");
				return;
			}

			toast.success(body.message ?? `Bon ${body.voucher.code} mis à jour`);
			setOpen(false);
			onUpdated?.();
		} catch {
			toast.error("Impossible de mettre à jour le bon");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setOpen(true)}>
						<Pencil className="size-4" />
						<span className="sr-only">Modifier</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Modifier</TooltipContent>
			</Tooltip>

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Modifier le bon</DialogTitle>
						<DialogDescription>
							Seuls les champs modifiés sont envoyés. La date de création reste figée.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="buyer_email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-mail de l&apos;acheteur (PDF envoyé à cette adresse)</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="recipient_email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-mail du destinataire</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="recipient_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nom du destinataire</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Code</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>Doit rester unique.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Statut</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{STATUS_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="product_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Produit</FormLabel>
										<VoucherProductSelect
											value={field.value}
											onChange={field.onChange}
											products={productOptions}
											isLoading={productsLoading}
										/>
										{productsError ? (
											<p className="text-sm text-destructive">{productsError.message}</p>
										) : null}
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message</FormLabel>
										<FormControl>
											<Textarea rows={3} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="expires_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expire le</FormLabel>
										<FormControl>
											<Input type="datetime-local" {...field} />
										</FormControl>
										<FormDescription>
											Si la date est passée, le bon sera marqué comme expiré. Si elle est future
											et que le bon était expiré, il redevient non utilisé.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-3">
								<FormField
									control={form.control}
									name="order_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>N° commande</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													value={field.value}
													onChange={(event) =>
														field.onChange(Number(event.target.value) || 0)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="order_item_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>N° ligne</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													value={field.value}
													onChange={(event) =>
														field.onChange(Number(event.target.value) || 0)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => handleOpenChange(false)}
									disabled={submitting}
								>
									Annuler
								</Button>
								<Button type="submit" disabled={submitting}>
									{submitting ? <Loader2 className="animate-spin" /> : null}
									{submitting ? "Enregistrement…" : "Enregistrer"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</>
	);
}
