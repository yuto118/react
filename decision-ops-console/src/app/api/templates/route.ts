import { NextResponse } from "next/server";
import { getDb } from "@/server/mockDb";

export function GET() {
  const db = getDb();
  return NextResponse.json({ templates: db.templates });
}

