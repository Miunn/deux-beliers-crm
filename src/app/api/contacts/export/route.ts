import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { buildExportWorkbookBuffer } from "@/lib/export-workbook";

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	const buf = await buildExportWorkbookBuffer();

	return new Response(new Uint8Array(buf), {
		status: 200,
		headers: {
			"Content-Type":
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": 'attachment; filename="crm-export.xlsx"',
		},
	});
}
