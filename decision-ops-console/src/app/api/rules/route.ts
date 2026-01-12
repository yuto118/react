import { NextRequest, NextResponse } from "next/server";
import { RuleSchema } from "@/lib/schemas";
import { nowIso, randomId } from "@/lib/utils";
import { getDb } from "@/server/mockDb";

export function GET() {
  const db = getDb();
  return NextResponse.json({ rules: db.rules });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // id/createdAt はサーバー側で採番
  const candidate = {
    ...(body ?? {}),
    id: randomId("rule"),
    createdAt: nowIso(),
  };
  const parsed = RuleSchema.safeParse(candidate);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid rule", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const db = getDb();
  db.rules.unshift(parsed.data);
  return NextResponse.json({ rule: parsed.data }, { status: 201 });
}

