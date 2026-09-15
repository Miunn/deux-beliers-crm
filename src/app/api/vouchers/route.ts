import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createVoucher, fetchVouchers } from "@/data/vouchers-service";
import type { CreateVoucherInput, VoucherStatus } from "@/types/voucher-types";
import { z } from "zod";

const CREATE_VOUCHER_SCHEMA = z.object({
	email: z.email("Adresse e-mail invalide"),
	name: z.string().optional(),
	code: z.string().optional(),
	message: z.string().optional(),
	buyer_email: z.union([z.literal(""), z.email("Adresse e-mail invalide")]).optional(),
	product_id: z.number().int().min(0).optional(),
	send_email: z.boolean().optional(),
});

const VALID_STATUSES = new Set<VoucherStatus>(["sent", "booked", "redeemed", "expired", "cancelled"]);

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { searchParams } = req.nextUrl;
	const statusParam = searchParams.get("status") ?? "";
	const search = searchParams.get("search") ?? "";
	const pageParam = Number(searchParams.get("page") ?? "1");
	const perPageParam = Number(searchParams.get("per_page") ?? "20");

	if (statusParam && !VALID_STATUSES.has(statusParam as VoucherStatus)) {
		return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
	}
	if (!Number.isFinite(pageParam) || pageParam < 1) {
		return NextResponse.json({ error: "Page invalide" }, { status: 400 });
	}
	if (!Number.isFinite(perPageParam) || perPageParam < 1 || perPageParam > 100) {
		return NextResponse.json({ error: "per_page invalide" }, { status: 400 });
	}

	try {
		const data = await fetchVouchers({
			status: statusParam as VoucherStatus | "",
			search,
			page: pageParam,
			per_page: perPageParam,
		});
		return NextResponse.json(data, {
			headers: { "Cache-Control": "no-store" },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Impossible de récupérer les bons";
		const status = message.includes("configurés") ? 503 : 502;
		return NextResponse.json({ error: message }, { status });
	}
}

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
	}

	const parsed = CREATE_VOUCHER_SCHEMA.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message ?? "Paramètres invalides";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	const input: CreateVoucherInput = {
		email: parsed.data.email,
		name: parsed.data.name,
		code: parsed.data.code,
		message: parsed.data.message,
		buyer_email: parsed.data.buyer_email || undefined,
		product_id: parsed.data.product_id,
		send_email: parsed.data.send_email ?? false,
	};

	try {
		const result = await createVoucher(input);
		return NextResponse.json(result.data, { status: result.status });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Impossible de créer le bon";
		const status = message.includes("configurés") ? 503 : 502;
		return NextResponse.json({ error: message }, { status });
	}
}
