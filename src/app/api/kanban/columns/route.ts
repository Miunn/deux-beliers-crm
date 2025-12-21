import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { KanbanService } from "@/data/kanban-service";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const columns = await KanbanService.get();
  return NextResponse.json(columns, { status: 200 });
}
