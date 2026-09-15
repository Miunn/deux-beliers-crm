"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { ResendVoucherResponse, Voucher } from "@/types/voucher-types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function deliveryEmail(voucher: Voucher): string {
	return voucher.buyer_email || voucher.recipient_email;
}

export default function ResendVoucherDialog({ voucher, onSent }: { voucher: Voucher; onSent?: () => void }) {
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const email = deliveryEmail(voucher);

	if (!email) return null;

	const handleConfirm = async () => {
		setSubmitting(true);
		try {
			const res = await fetch(`/api/vouchers/${voucher.id}/resend`, { method: "POST" });
			const body = (await res.json()) as ResendVoucherResponse & { error?: string };

			if (!res.ok) {
				toast.error(body.error ?? "Impossible de renvoyer l'e-mail");
				return;
			}

			toast.success(body.message ?? `E-mail renvoyé à ${body.delivery_email || email}`);
			setOpen(false);
			onSent?.();
		} catch {
			toast.error("Impossible de renvoyer l'e-mail");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setOpen(true)}>
						<Mail className="size-4" />
						<span className="sr-only">Renvoyer l&apos;e-mail</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Renvoyer l&apos;e-mail</TooltipContent>
			</Tooltip>

			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!submitting) setOpen(nextOpen);
				}}
			>
				<DialogContent showCloseButton={!submitting}>
					<DialogHeader>
						<DialogTitle>Renvoyer l&apos;e-mail du bon</DialogTitle>
						<DialogDescription>
							Le PDF du bon <span className="font-mono font-medium">{voucher.code}</span> sera renvoyé à{" "}
							<span className="font-medium">{email}</span>
							{voucher.buyer_email ? " (e-mail de livraison)" : " (destinataire)"}.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
							Annuler
						</Button>
						<Button onClick={handleConfirm} disabled={submitting}>
							{submitting ? <Loader2 className="animate-spin" /> : null}
							{submitting ? "Envoi…" : "Renvoyer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
