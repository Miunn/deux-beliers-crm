"use client";

import { useState } from "react";
import { CalendarCheck, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Voucher, VoucherStatus } from "@/types/voucher-types";
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

type VoucherAction = "book" | "redeem";

const ACTION_CONFIG: Record<
	VoucherAction,
	{
		allowedStatuses: VoucherStatus[];
		endpoint: string;
		label: string;
		title: string;
		description: string;
		successFallback: (code: string) => string;
		errorFallback: string;
		icon: typeof Check;
	}
> = {
	book: {
		allowedStatuses: ["sent"],
		endpoint: "/api/vouchers/book",
		label: "Marquer comme réservé",
		title: "Marquer le bon comme réservé",
		description: "Le bon pourra ensuite être marqué comme utilisé lors de la visite.",
		successFallback: (code) => `Bon ${code} marqué comme réservé`,
		errorFallback: "Impossible de marquer le bon comme réservé",
		icon: CalendarCheck,
	},
	redeem: {
		allowedStatuses: ["sent", "booked"],
		endpoint: "/api/vouchers/redeem",
		label: "Marquer comme utilisé",
		title: "Marquer le bon comme utilisé",
		description: "Cette action est définitive. Le bon ne pourra plus être utilisé.",
		successFallback: (code) => `Bon ${code} marqué comme utilisé`,
		errorFallback: "Impossible de marquer le bon comme utilisé",
		icon: Check,
	},
};

export default function VoucherActionDialog({
	voucher,
	action,
	onDone,
}: {
	voucher: Voucher;
	action: VoucherAction;
	onDone?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const config = ACTION_CONFIG[action];

	if (!config.allowedStatuses.includes(voucher.status)) return null;

	const Icon = config.icon;

	const handleConfirm = async () => {
		setSubmitting(true);
		try {
			const res = await fetch(config.endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: voucher.code }),
			});

			const body = (await res.json()) as { error?: string; message?: string };

			if (!res.ok) {
				toast.error(body.error ?? config.errorFallback);
				return;
			}

			toast.success(body.message ?? config.successFallback(voucher.code));
			setOpen(false);
			onDone?.();
		} catch {
			toast.error(config.errorFallback);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setOpen(true)}>
						<Icon className="size-4" />
						<span className="sr-only">{config.label}</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>{config.label}</TooltipContent>
			</Tooltip>

			<Dialog
				open={open}
				onOpenChange={(nextOpen) => {
					if (!submitting) setOpen(nextOpen);
				}}
			>
				<DialogContent showCloseButton={!submitting}>
					<DialogHeader>
						<DialogTitle>{config.title}</DialogTitle>
						<DialogDescription>
							{config.description} Bon <span className="font-mono font-medium">{voucher.code}</span>
							{voucher.recipient_name || voucher.recipient_email ? (
								<>
									. Destinataire : {voucher.recipient_name || voucher.recipient_email}
									{voucher.recipient_name ? ` (${voucher.recipient_email})` : ""}
								</>
							) : null}
							.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
							Annuler
						</Button>
						<Button onClick={handleConfirm} disabled={submitting}>
							{submitting ? <Loader2 className="animate-spin" /> : null}
							{submitting ? "En cours…" : "Confirmer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
