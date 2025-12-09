import { EventsService } from "@/data/events-service";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ContactService } from "@/data/contact-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const events = await EventsService.getByContact(id);
  const contact = await ContactService.getById(id);
  return NextResponse.json({ contact, events }, { status: 200 });
}
