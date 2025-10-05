import { ActivitesService } from "@/data/activites-service";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activites = await ActivitesService.getActivites();
  return NextResponse.json(activites, { status: 200 });
}
