import { NextRequest, NextResponse } from "next/server";
import { AuditLogSchema } from "@/lib/schemas";
import { addLog, getDb } from "@/server/mockDb";

export function GET(req: NextRequest) {
  const db = getDb();
  const url = new URL(req.url);
  const actor = url.searchParams.get("actor")?.trim() ?? "";
  const action = url.searchParams.get("action")?.trim() ?? "";
  const caseId = url.searchParams.get("caseId")?.trim() ?? "";
  const from = url.searchParams.get("from")?.trim() ?? "";
  const to = url.searchParams.get("to")?.trim() ?? "";

  const fromMs = from ? new Date(from).getTime() : null;
  const toMs = to ? new Date(to).getTime() : null;

  const logs = db.logs.filter((l) => {
    if (actor && l.actor !== actor) return false;
    if (action && l.action !== action) return false;
    if (caseId && l.caseId !== caseId) return false;
    const ms = new Date(l.createdAt).getTime();
    if (fromMs != null && ms < fromMs) return false;
    if (toMs != null && ms > toMs) return false;
    return true;
  });

  logs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // クライアントからは id/createdAt なしで投げてOK
  const candidate = {
    id: "x",
    createdAt: new Date().toISOString(),
    ...(body ?? {}),
  };
  const parsed = AuditLogSchema.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid log", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const log = addLog({
    caseId: parsed.data.caseId,
    actor: parsed.data.actor,
    action: parsed.data.action,
    payload: parsed.data.payload,
  });
  return NextResponse.json({ log }, { status: 201 });
}

