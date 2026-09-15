import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redeemVoucher, VoucherActionError } from "@/data/vouchers-service";
import { z } from "zod";

const REDEEM_VOUCHER_SCHEMA = z.object({
	code: z.string().min(1, "Code requis"),
});

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
	}

	const parsed = REDEEM_VOUCHER_SCHEMA.safeParse(body);
	if (!parsed.success) {
		const message = parsed.error.issues[0]?.message ?? "Paramètres invalides";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	try {
		const data = await redeemVoucher(parsed.data.code);
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof VoucherActionError) {
			return NextResponse.json(
				{ error: error.message, found: error.data?.found, redeemed: error.data?.redeemed ?? false },
				{ status: error.status === 401 ? 502 : error.status },
			);
		}
		const message = error instanceof Error ? error.message : "Impossible de marquer le bon comme utilisé";
		const status = message.includes("configurés") ? 503 : 502;
		return NextResponse.json({ error: message }, { status });
	}
}
