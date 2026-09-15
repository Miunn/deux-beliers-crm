import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchVoucher, updateVoucher } from "@/data/vouchers-service";
import type { UpdateVoucherInput, VoucherStatus } from "@/types/voucher-types";
import { z } from "zod";

const VALID_STATUSES = new Set<VoucherStatus>(["sent", "booked", "redeemed", "expired", "cancelled"]);

const UPDATE_VOUCHER_SCHEMA = z
	.object({
		recipient_email: z.email("Adresse e-mail invalide").optional(),
		email: z.email("Adresse e-mail invalide").optional(),
		recipient_name: z.string().optional(),
		name: z.string().optional(),
		buyer_email: z.union([z.literal(""), z.email("Adresse e-mail de l'acheteur invalide")]).optional(),
		message: z.string().optional(),
		product_id: z.number().int().min(0).optional(),
		code: z.string().min(1, "Code invalide").optional(),
		status: z
			.string()
			.refine((value) => VALID_STATUSES.has(value as VoucherStatus), "Statut invalide")
			.optional(),
		expires_at: z.union([z.string(), z.null()]).optional(),
		order_id: z.number().int().min(0).optional(),
		order_item_id: z.number().int().min(0).optional(),
	})
	.refine((value) => Object.values(value).some((field) => field !== undefined), {
		message: "Aucun champ à mettre à jour",
	});

function parseId(raw: string): number | null {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) return null;
	return id;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const id = parseId((await params).id);
	if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

	try {
		const data = await fetchVoucher(id);
		return NextResponse.json(data, {
			headers: { "Cache-Control": "no-store" },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Impossible de récupérer le bon";
		const status = message.includes("configurés") ? 503 : message.includes("introuvable") ? 404 : 502;
		return NextResponse.json({ error: message }, { status });
	}
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const id = parseId((await params).id);
	if (!id) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
	}

	const parsed = UPDATE_VOUCHER_SCHEMA.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message ?? "Paramètres invalides";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	const input: UpdateVoucherInput = {
		...parsed.data,
		status: parsed.data.status as VoucherStatus | undefined,
	};

	try {
		const data = await updateVoucher(id, input);
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Impossible de mettre à jour le bon";
		const status = message.includes("configurés")
			? 503
			: message.includes("existe déjà")
				? 409
				: message.includes("introuvable")
					? 404
					: 502;
		return NextResponse.json({ error: message }, { status });
	}
}
