import { NextRequest, NextResponse } from "next/server";
import { ContactService } from "@/data/contact-service";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const labelId = searchParams.get("labelId") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const contacts = await ContactService.getContacts(
    q || undefined,
    labelId || undefined,
    from || undefined,
    to || undefined
  );
  return NextResponse.json(contacts);
}
