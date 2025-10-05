import { LabelsService } from "@/data/labels-service";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const labels = await LabelsService.getLabels();
  return NextResponse.json(labels, { status: 200 });
}
