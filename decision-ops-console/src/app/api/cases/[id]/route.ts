import { NextRequest, NextResponse } from "next/server";
import { PatchCaseBodySchema } from "@/lib/schemas";
import { nowIso } from "@/lib/utils";
import { addLog, evaluateRulesForCase, getDb } from "@/server/mockDb";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await ctx.params;
  const c = db.cases.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ case: c });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = PatchCaseBodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const db = getDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const patch = parsed.data;
  const actor = patch.actor ?? "demo_user";
  const before = { status: c.status, assignee: c.assignee };

  if (typeof patch.assignee !== "undefined") {
    c.assignee = patch.assignee;
    addLog({
      caseId: c.id,
      actor,
      action: "ASSIGN",
      payload: { assignee: c.assignee },
    });
  }

  if (patch.facts) {
    c.facts = patch.facts;
  }

  if (patch.rollbackStepId) {
    c.stepResults = c.stepResults.filter((r) => r.stepId !== patch.rollbackStepId);
    addLog({
      caseId: c.id,
      actor,
      action: "ROLLBACK",
      payload: { stepId: patch.rollbackStepId },
    });
  }

  if (patch.stepResult) {
    const updatedAt = nowIso();
    const next = {
      stepId: patch.stepResult.stepId,
      decision: patch.stepResult.decision,
      inputs: patch.stepResult.inputs,
      checklist: patch.stepResult.checklist as Record<string, boolean> | undefined,
      comment: patch.stepResult.comment,
      updatedAt,
    };
    const idx = c.stepResults.findIndex((r) => r.stepId === patch.stepResult!.stepId);
    if (idx >= 0) c.stepResults[idx] = { ...c.stepResults[idx]!, ...next };
    else c.stepResults.push(next);

    if (c.status === "NEW") c.status = "IN_PROGRESS";

    addLog({
      caseId: c.id,
      actor,
      action: "UPDATE_STEP",
      payload: { stepId: patch.stepResult.stepId, patch: patch.stepResult },
    });
  }

  if (patch.status) {
    c.status = patch.status;
    addLog({
      caseId: c.id,
      actor,
      action: patch.status === "APPROVED" ? "APPROVE" : patch.status === "REJECTED" ? "REJECT" : "CHANGE_STATUS",
      payload: { from: before.status, to: c.status },
    });
  }

  // ルール自動評価（最終状態は上書きしない）
  const auto = evaluateRulesForCase(c);
  const finalStatuses = new Set(["APPROVED", "REJECTED", "DONE", "FAILED"]);
  if (auto && !finalStatuses.has(c.status)) {
    if (c.status !== auto) {
      const from = c.status;
      c.status = auto;
      addLog({
        caseId: c.id,
        actor: "system",
        action: "CHANGE_STATUS",
        payload: { from, to: auto, via: "rule" },
      });
    }
  }

  c.updatedAt = nowIso();

  const after = { status: c.status, assignee: c.assignee };
  if (before.assignee !== after.assignee || before.status !== after.status) {
    // already logged; keep as-is
  }

  return NextResponse.json({ case: c });
}

