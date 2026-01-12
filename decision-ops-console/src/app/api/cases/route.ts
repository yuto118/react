import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/mockDb";

export function GET(req: NextRequest) {
  const db = getDb();
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const status = url.searchParams.get("status") ?? "";
  const assignee = url.searchParams.get("assignee") ?? "";
  const priority = url.searchParams.get("priority") ?? "";

  const filtered = db.cases.filter((c) => {
    if (q) {
      const hay = `${c.id} ${c.title}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (status && c.status !== status) return false;
    if (priority && c.priority !== priority) return false;
    if (assignee) {
      if (assignee === "UNASSIGNED") return c.assignee == null;
      return c.assignee === assignee;
    }
    return true;
  });

  // updatedAt desc
  filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return NextResponse.json({ cases: filtered });
}

