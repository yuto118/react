import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/mockDb";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const before = db.rules.length;
  db.rules = db.rules.filter((r) => r.id !== id);
  if (db.rules.length === before) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

