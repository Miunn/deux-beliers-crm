"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVoucherProducts } from "@/hooks/use-vouchers";
import type { CreateVoucherResponse } from "@/types/voucher-types";
import VoucherProductSelect from "./VoucherProductSelect";

const CREATE_VOUCHER_FORM_SCHEMA = z.object({
	email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
	name: z.string().optional(),
	code: z.string().optional(),
	product_id: z.number().int().min(0, "ID produit invalide"),
	buyer_email: z.union([z.literal(""), z.string().email("Adresse e-mail invalide")]).optional(),
	message: z.string().optional(),
	send_email: z.boolean(),
});

type CreateVoucherFormValues = z.infer<typeof CREATE_VOUCHER_FORM_SCHEMA>;

export default function CreateVoucherDialog({ onCreated }: { onCreated?: () => void }) {
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { products, error: productsError, isLoading: productsLoading } = useVoucherProducts(open);

	const form = useForm<CreateVoucherFormValues>({
		resolver: zodResolver(CREATE_VOUCHER_FORM_SCHEMA),
		defaultValues: {
			email: "",
			name: "",
			code: "",
			product_id: 0,
			buyer_email: "",
			message: "",
			send_email: false,
		},
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (!submitting) {
			setOpen(nextOpen);
			if (!nextOpen) form.reset();
		}
	};

	const onSubmit = async (values: CreateVoucherFormValues) => {
		setSubmitting(true);
		try {
			const res = await fetch("/api/vouchers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: values.email,
					name: values.name ?? "",
					code: values.code?.trim() ?? "",
					product_id: values.product_id,
					...(values.buyer_email ? { buyer_email: values.buyer_email } : {}),
					message: values.message ?? "",
					send_email: values.send_email,
				}),
			});

			const body = (await res.json()) as CreateVoucherResponse & { error?: string };

			if (!res.ok) {
				toast.error(body.error ?? "Impossible de créer le bon");
				return;
			}

			if (res.status === 202) {
				toast.warning(
					`Bon ${body.voucher.code} créé, mais l'e-mail n'a pas pu être envoyé. Ne pas recréer le bon.`,
				);
			} else if (values.send_email) {
				toast.success(`Bon ${body.voucher.code} créé et e-mail envoyé`);
			} else {
				toast.success(`Bon ${body.voucher.code} créé`);
			}

			setOpen(false);
			form.reset();
			onCreated?.();
		} catch {
			toast.error("Impossible de créer le bon");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Créer un bon
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Créer un bon de visite</DialogTitle>
					<DialogDescription>
						Le bon expire dans 12 mois, avec le statut « Non utilisé ». L&apos;e-mail avec PDF n&apos;est
						envoyé que si vous cochez l&apos;option.
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
										<Input type="email" placeholder="jean@example.com" {...field} />
									</FormControl>
									<FormDescription>
										E-mail où envoyer le PDF. Laisser vide pour utiliser l&apos;e-mail du
										destinataire.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>E-mail du destinataire</FormLabel>
									<FormControl>
										<Input type="email" placeholder="marie@example.com" {...field} />
									</FormControl>
									<FormDescription>Pour la prise de rendez-vous.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nom du destinataire</FormLabel>
									<FormControl>
										<Input placeholder="Marie Dupont" {...field} />
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
										<Input placeholder="DB-XXXX" {...field} />
									</FormControl>
									<FormDescription>
										Optionnel. Laisser vide pour générer un code automatiquement. Doit être unique.
									</FormDescription>
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
										products={products}
										isLoading={productsLoading}
									/>
									{productsError ? (
										<p className="text-sm text-destructive">{productsError.message}</p>
									) : (
										<FormDescription>
											Produits voucher WooCommerce. Aucun si le bon n&apos;est pas lié à un
											produit.
										</FormDescription>
									)}
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
										<Textarea placeholder="Joyeux anniversaire" rows={3} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="send_email"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start gap-3">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => field.onChange(checked === true)}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel className="font-normal">Envoyer l&apos;e-mail du bon</FormLabel>
											<FormDescription>
												Décochez pour créer le bon sans envoyer le PDF par e-mail.
											</FormDescription>
										</div>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

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
								{submitting ? "Création…" : "Créer le bon"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
