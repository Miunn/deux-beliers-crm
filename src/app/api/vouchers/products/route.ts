import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchVoucherProducts } from "@/data/vouchers-service";

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const data = await fetchVoucherProducts();
		return NextResponse.json(data, {
			headers: { "Cache-Control": "no-store" },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Impossible de récupérer les produits";
		const status = message.includes("configurés") ? 503 : 502;
		return NextResponse.json({ error: message }, { status });
	}
}
