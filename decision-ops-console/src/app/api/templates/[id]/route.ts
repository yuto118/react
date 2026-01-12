import { NextRequest, NextResponse } from "next/server";
import { TemplateSchema } from "@/lib/schemas";
import { addLog, getDb } from "@/server/mockDb";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await ctx.params;
  const t = db.templates.find((x) => x.id === id);
  if (!t) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return NextResponse.json({ template: t });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = TemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid template", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (parsed.data.id !== id) {
    return NextResponse.json({ error: "ID mismatch" }, { status: 400 });
  }

  const db = getDb();
  const idx = db.templates.findIndex((x) => x.id === id);
  if (idx < 0) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  db.templates[idx] = parsed.data;
  addLog({
    caseId: "system",
    actor: "system",
    action: "ADD_COMMENT",
    payload: { type: "TEMPLATE_UPDATED", templateId: id },
  });

  return NextResponse.json({ template: db.templates[idx] });
}

