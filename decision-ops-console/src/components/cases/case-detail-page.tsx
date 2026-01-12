"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clipboard, CornerDownLeft, CornerDownRight, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Case, DecisionOption, Step, StepResult, Template } from "@/types/models";
import { api } from "@/lib/api";
import { cn, formatDateTime } from "@/lib/utils";
import { useCaseStepperStore } from "@/stores/caseStepperStore";
import { useToastStore } from "@/stores/toastStore";
import { useUserStore } from "@/stores/userStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

function stepResultFor(caseData: Case, stepId: string): StepResult | undefined {
  return caseData.stepResults.find((r) => r.stepId === stepId);
}

function isStepComplete(step: Step, r?: StepResult) {
  if (!step.required) return true;
  if (!r) return false;
  if (step.type === "DECISION") return typeof r.decision === "string";
  if (step.type === "INPUT") {
    const fields = step.inputSchema?.fields ?? [];
    if (fields.length === 0) return true;
    const inputs = (r.inputs ?? {}) as Record<string, unknown>;
    return fields.every((f) => {
      if (!f.required) return true;
      const v = inputs[f.name];
      if (f.type === "number") return typeof v === "number" && Number.isFinite(v);
      return typeof v === "string" && v.trim().length > 0;
    });
  }
  if (step.type === "CHECKLIST") {
    const items = step.checklistItems ?? [];
    const checks = (r.checklist ?? {}) as Record<string, boolean>;
    return items.every((it) => (it.required ? checks[it.id] === true : true));
  }
  return false;
}

function allRequiredComplete(tpl: Template, c: Case) {
  return tpl.steps.every((s) => isStepComplete(s, stepResultFor(c, s.id)));
}

function statusTone(status: Case["status"]) {
  switch (status) {
    case "NEW":
      return "sky";
    case "IN_PROGRESS":
      return "amber";
    case "NEEDS_REVIEW":
      return "rose";
    case "APPROVED":
    case "DONE":
      return "emerald";
    case "REJECTED":
    case "FAILED":
      return "rose";
  }
}

function priorityTone(p: Case["priority"]) {
  switch (p) {
    case "LOW":
      return "zinc";
    case "MEDIUM":
      return "amber";
    case "HIGH":
      return "rose";
  }
}

export function CaseDetailPage({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const toast = useToastStore();
  const { actor } = useUserStore();
  const { currentIndexByCaseId, setCurrentIndex } = useCaseStepperStore();
  const currentIndex = currentIndexByCaseId[caseId] ?? 0;

  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [rollbackStepId, setRollbackStepId] = useState<string>("");
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");

  const caseQuery = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => api.cases.get(caseId),
  });

  const templateQuery = useQuery({
    queryKey: ["templateForCase", caseId, caseQuery.data?.case.templateId],
    enabled: !!caseQuery.data?.case.templateId,
    queryFn: () => api.templates.get(caseQuery.data!.case.templateId),
  });

  const logsQuery = useQuery({
    queryKey: ["logs", "case", caseId],
    queryFn: () => api.logs.list({ caseId }),
  });

  // OPEN_CASE は一度だけ記録
  useEffect(() => {
    if (!caseQuery.data) return;
    api.logs
      .create({ caseId, actor, action: "OPEN_CASE", payload: {} })
      .catch(() => null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, caseQuery.data?.case.id]);

  const patchMutation = useMutation({
    mutationFn: (body: Parameters<typeof api.cases.patch>[1]) => api.cases.patch(caseId, body),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["case", caseId] }),
        qc.invalidateQueries({ queryKey: ["logs", "case", caseId] }),
        qc.invalidateQueries({ queryKey: ["cases"] }),
      ]);
    },
    onError: (e) => toast.push({ kind: "error", title: "更新に失敗", message: String(e) }),
  });

  const approveMutation = useMutation({
    mutationFn: (next: "APPROVED" | "REJECTED") => api.cases.patch(caseId, { status: next, actor }),
    onSuccess: async (_res, next) => {
      toast.push({ kind: next === "APPROVED" ? "success" : "info", title: next === "APPROVED" ? "承認しました" : "却下しました" });
      await qc.invalidateQueries({ queryKey: ["case", caseId] });
      await qc.invalidateQueries({ queryKey: ["logs", "case", caseId] });
      await qc.invalidateQueries({ queryKey: ["cases"] });
    },
    onError: (e) => toast.push({ kind: "error", title: "状態更新に失敗", message: String(e) }),
  });

  const caseData = caseQuery.data?.case;
  const template = templateQuery.data?.template;

  const steps = template?.steps ?? [];
  const step = steps[currentIndex];

  useEffect(() => {
    if (!template) return;
    if (currentIndex >= template.steps.length) setCurrentIndex(caseId, template.steps.length - 1);
  }, [caseId, currentIndex, setCurrentIndex, template]);

  const completion = useMemo(() => {
    if (!caseData || !template) return { canApprove: false, allComplete: false, currentComplete: false };
    const allComplete = allRequiredComplete(template, caseData);
    const currentComplete = step ? isStepComplete(step, stepResultFor(caseData, step.id)) : false;
    return { canApprove: allComplete, allComplete, currentComplete };
  }, [caseData, template, step]);

  if (caseQuery.isLoading || templateQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <Spinner /> 読み込み中…
      </div>
    );
  }
  if (caseQuery.isError || templateQuery.isError || !caseData || !template) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
        読み込みに失敗しました: {String(caseQuery.error ?? templateQuery.error ?? "unknown")}
      </div>
    );
  }

  const currentResult = step ? stepResultFor(caseData, step.id) : undefined;

  const onRollbackConfirm = () => {
    if (!rollbackStepId) return;
    patchMutation.mutate({ rollbackStepId, actor });
    const idx = steps.findIndex((s) => s.id === rollbackStepId);
    if (idx >= 0) setCurrentIndex(caseId, idx);
    toast.push({ kind: "info", title: "ロールバックしました", message: `stepId=${rollbackStepId}` });
    setRollbackOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-mono text-xs text-zinc-600">{caseData.id}</div>
            <Badge tone={statusTone(caseData.status)}>{caseData.status}</Badge>
            <Badge tone={priorityTone(caseData.priority)}>{caseData.priority}</Badge>
            {caseData.assignee ? <Badge tone="zinc">assignee: {caseData.assignee}</Badge> : <Badge tone="zinc">未割り当て</Badge>}
          </div>
          <div className="mt-1 truncate text-lg font-semibold">{caseData.title}</div>
          <div className="mt-1 text-sm text-zinc-600">
            Template: <span className="font-medium text-zinc-900">{template.name}</span> / 更新:{" "}
            {formatDateTime(caseData.updatedAt)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setRollbackOpen(true)}>
            <RotateCcw className="h-4 w-4" />
            ロールバック
          </Button>
          <Button
            variant="secondary"
            onClick={() => setReturnOpen(true)}
            disabled={approveMutation.isPending || patchMutation.isPending}
          >
            差戻し
          </Button>
          <Button
            variant="primary"
            disabled={!completion.canApprove || approveMutation.isPending}
            onClick={() => approveMutation.mutate("APPROVED")}
          >
            承認 (Approve)
          </Button>
          <Button
            variant="danger"
            disabled={!completion.canApprove || approveMutation.isPending}
            onClick={() => approveMutation.mutate("REJECTED")}
          >
            却下 (Reject)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 左: Facts */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Facts</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {caseData.facts.length === 0 ? (
                  <div className="text-sm text-zinc-600">Facts がありません。</div>
                ) : (
                  caseData.facts.map((f) => (
                    <div key={f.key} className="rounded-lg border border-zinc-200 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-700">{f.key}</div>
                          <div className="truncate text-sm text-zinc-900">{f.value}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await navigator.clipboard.writeText(f.value).catch(() => null);
                            toast.push({ kind: "success", title: "コピーしました", message: `${f.key}` });
                          }}
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 中: Stepper */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle>Stepper</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-zinc-700">
                  現在: <span className="font-semibold text-zinc-900">{step?.title ?? "—"}</span>{" "}
                  <span className="text-zinc-500">
                    ({currentIndex + 1}/{steps.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentIndex(caseId, Math.max(0, currentIndex - 1))}
                    disabled={currentIndex <= 0}
                  >
                    <CornerDownLeft className="h-4 w-4" />
                    戻る
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentIndex(caseId, Math.min(steps.length - 1, currentIndex + 1))}
                    disabled={currentIndex >= steps.length - 1 || (step?.required && !completion.currentComplete)}
                  >
                    次へ
                    <CornerDownRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!step ? (
                <div className="text-sm text-zinc-600">ステップがありません。</div>
              ) : (
                <StepPanel
                  caseId={caseId}
                  actor={actor}
                  step={step}
                  result={currentResult}
                  onSave={(patch) => patchMutation.mutate({ actor, stepResult: { stepId: step.id, ...patch } })}
                  saving={patchMutation.isPending}
                />
              )}

              <div className="mt-4 border-t pt-3">
                <div className="mb-2 text-xs font-semibold text-zinc-700">進捗</div>
                <div className="space-y-1">
                  {steps.map((s, idx) => {
                    const r = stepResultFor(caseData, s.id);
                    const done = isStepComplete(s, r);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCurrentIndex(caseId, idx)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
                          idx === currentIndex ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-zinc-900">{s.title}</div>
                          <div className="text-xs text-zinc-600">
                            {s.type} {s.required ? "(必須)" : "(任意)"}
                          </div>
                        </div>
                        <Badge tone={done ? "emerald" : "zinc"}>{done ? "DONE" : "PENDING"}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 右: 参考情報 & ログ */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>参考情報</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-sm text-zinc-600">
                MVPでは簡易表示です。将来的に添付/関連リンク/外部システム情報などを統合できます。
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>過去ログ（このCase）</CardTitle>
            </CardHeader>
            <CardBody>
              {logsQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Spinner /> 読み込み中…
                </div>
              ) : logsQuery.isError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-900">
                  取得失敗: {String(logsQuery.error)}
                </div>
              ) : (logsQuery.data?.logs?.length ?? 0) === 0 ? (
                <div className="text-sm text-zinc-600">ログがありません。</div>
              ) : (
                <div className="space-y-2">
                  {(logsQuery.data?.logs ?? []).slice(0, 12).map((l) => (
                    <div key={l.id} className="rounded-lg border border-zinc-200 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-zinc-800">{l.action}</div>
                        <div className="text-xs text-zinc-600">{formatDateTime(l.createdAt)}</div>
                      </div>
                      <div className="mt-1 text-xs text-zinc-700">
                        actor: <span className="font-mono">{l.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Dialog
        open={rollbackOpen}
        onOpenChange={setRollbackOpen}
        title="ロールバック"
        description="指定したステップ結果を初期化します（監査ログに記録されます）。"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRollbackOpen(false)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={onRollbackConfirm} disabled={!rollbackStepId || patchMutation.isPending}>
              実行
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-700">対象ステップ</div>
          <Select value={rollbackStepId} onChange={(e) => setRollbackStepId(e.target.value)}>
            <option value="">選択してください</option>
            {steps.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.id})
              </option>
            ))}
          </Select>
          <div className="text-xs text-zinc-600">
            現在ステップより前をロールバックする場合、自動でそのステップに戻ります。
          </div>
        </div>
      </Dialog>

      <Dialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        title="差戻し"
        description="ステータスを NEEDS_REVIEW に変更し、理由を監査ログに残します。"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReturnOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  await api.cases.patch(caseId, { status: "NEEDS_REVIEW", actor });
                  if (returnComment.trim()) {
                    await api.logs.create({
                      caseId,
                      actor,
                      action: "ADD_COMMENT",
                      payload: { kind: "RETURN", comment: returnComment.trim() },
                    });
                  }
                  setReturnComment("");
                  toast.push({ kind: "info", title: "差戻しました", message: "status=NEEDS_REVIEW" });
                  await qc.invalidateQueries({ queryKey: ["case", caseId] });
                  await qc.invalidateQueries({ queryKey: ["logs", "case", caseId] });
                  await qc.invalidateQueries({ queryKey: ["cases"] });
                  setReturnOpen(false);
                } catch (e) {
                  toast.push({ kind: "error", title: "差戻しに失敗", message: String(e) });
                }
              }}
              disabled={approveMutation.isPending || patchMutation.isPending}
            >
              実行
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-700">理由（任意）</div>
          <Textarea
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
            placeholder="差戻し理由・追加確認事項など…"
          />
        </div>
      </Dialog>
    </div>
  );
}

function StepPanel({
  caseId,
  actor,
  step,
  result,
  onSave,
  saving,
}: {
  caseId: string;
  actor: string;
  step: Step;
  result?: StepResult;
  onSave: (patch: Omit<StepResult, "stepId" | "updatedAt">) => void;
  saving: boolean;
}) {
  if (step.type === "DECISION") {
    return <DecisionStepPanel step={step} result={result} onSave={onSave} saving={saving} />;
  }
  if (step.type === "CHECKLIST") {
    return <ChecklistStepPanel step={step} result={result} onSave={onSave} saving={saving} />;
  }
  return (
    <InputStepPanel
      caseId={caseId}
      actor={actor}
      step={step}
      result={result}
      onSave={onSave}
      saving={saving}
    />
  );
}

function DecisionStepPanel({
  step,
  result,
  onSave,
  saving,
}: {
  step: Step;
  result?: StepResult;
  onSave: (patch: Omit<StepResult, "stepId" | "updatedAt">) => void;
  saving: boolean;
}) {
  const toast = useToastStore();
  const options = step.decisionOptions ?? ["YES", "NO", "HOLD"];
  const current = result?.decision;
  return (
    <div className="space-y-3">
      {step.description ? <div className="text-sm text-zinc-600">{step.description}</div> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button
            key={opt}
            variant={current === opt ? (opt === "NO" ? "danger" : "primary") : "secondary"}
            onClick={() => {
              onSave({ decision: opt as DecisionOption, comment: result?.comment });
              toast.push({ kind: "success", title: "判断を更新しました", message: `${step.id}: ${opt}` });
            }}
            disabled={saving}
          >
            {opt}
          </Button>
        ))}
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-zinc-700">コメント</div>
        <Textarea
          defaultValue={result?.comment ?? ""}
          placeholder="この判断の根拠や補足を記録…"
          onBlur={(e) => {
            const next = e.target.value;
            if ((result?.comment ?? "") === next) return;
            onSave({ decision: result?.decision, comment: next });
            toast.push({ kind: "info", title: "コメントを保存しました" });
          }}
        />
      </div>
    </div>
  );
}

function ChecklistStepPanel({
  step,
  result,
  onSave,
  saving,
}: {
  step: Step;
  result?: StepResult;
  onSave: (patch: Omit<StepResult, "stepId" | "updatedAt">) => void;
  saving: boolean;
}) {
  const items = step.checklistItems ?? [];
  const checks = (result?.checklist ?? {}) as Record<string, boolean>;
  return (
    <div className="space-y-3">
      <div className="text-sm text-zinc-600">必要項目をチェックして進めます。</div>
      <div className="space-y-2">
        {items.map((it) => (
          <label key={it.id} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-2">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={checks[it.id] ?? false}
              onChange={(e) => {
                const next = { ...checks, [it.id]: e.target.checked };
                onSave({ checklist: next, comment: result?.comment });
              }}
              disabled={saving}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-900">
                {it.label} {it.required ? <span className="text-xs text-rose-700">(必須)</span> : null}
              </div>
              <div className="text-xs text-zinc-600">id: {it.id}</div>
            </div>
          </label>
        ))}
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-zinc-700">コメント</div>
        <Textarea
          defaultValue={result?.comment ?? ""}
          placeholder="チェックに関する補足…"
          onBlur={(e) => {
            const next = e.target.value;
            if ((result?.comment ?? "") === next) return;
            onSave({ checklist: checks, comment: next });
          }}
        />
      </div>
    </div>
  );
}

function InputStepPanel({
  caseId,
  actor,
  step,
  result,
  onSave,
  saving,
}: {
  caseId: string;
  actor: string;
  step: Step;
  result?: StepResult;
  onSave: (patch: Omit<StepResult, "stepId" | "updatedAt">) => void;
  saving: boolean;
}) {
  const toast = useToastStore();
  const fields = useMemo(() => step.inputSchema?.fields ?? [], [step.inputSchema]);

  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const f of fields) {
      const req = !!f.required;
      if (f.type === "number") {
        shape[f.name] = req ? z.coerce.number().finite() : z.coerce.number().finite().optional();
      } else {
        shape[f.name] = req ? z.string().min(1, `${f.label}は必須です`) : z.string().optional();
      }
    }
    return z.object(shape);
  }, [fields]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: (result?.inputs as Record<string, unknown> | undefined) ?? {},
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset((result?.inputs as Record<string, unknown> | undefined) ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, step.id, result?.updatedAt]);

  const submit = form.handleSubmit((values) => {
    onSave({ inputs: values, comment: result?.comment });
    toast.push({ kind: "success", title: "入力を保存しました" });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      {step.description ? <div className="text-sm text-zinc-600">{step.description}</div> : null}
      <div className="space-y-3">
        {fields.map((f) => {
          const err = form.formState.errors[f.name]?.message as string | undefined;
          const name = f.name as never;
          const common = {
            ...form.register(name),
          };
          return (
            <div key={f.name}>
              <div className="mb-1 text-xs font-semibold text-zinc-700">
                {f.label} {f.required ? <span className="text-rose-700">(必須)</span> : null}
              </div>
              {f.type === "select" ? (
                <Select {...common} defaultValue={String((result?.inputs ?? {})[f.name] ?? "")}>
                  <option value="">選択してください</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </Select>
              ) : f.type === "date" ? (
                <Input type="date" {...common} />
              ) : f.type === "number" ? (
                <Input type="number" inputMode="numeric" {...common} />
              ) : (
                <Input type="text" {...common} />
              )}
              {err ? <div className="mt-1 text-xs text-rose-700">{err}</div> : null}
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold text-zinc-700">コメント</div>
        <Textarea
          defaultValue={result?.comment ?? ""}
          placeholder="入力に関する補足…"
          onBlur={(e) => {
            const next = e.target.value;
            if ((result?.comment ?? "") === next) return;
            onSave({ inputs: (form.getValues() ?? {}) as Record<string, unknown>, comment: next });
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-zinc-600">actor: {actor}</div>
        <Button type="submit" disabled={saving}>
          保存
        </Button>
      </div>
    </form>
  );
}

