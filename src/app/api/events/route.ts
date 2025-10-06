import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { EventsService } from "@/data/events-service";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to query params are required (ISO dates)" },
      { status: 400 }
    );
  }
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const events = await EventsService.getByDateRange(fromDate, toDate);
  return NextResponse.json(events, { status: 200 });
}
