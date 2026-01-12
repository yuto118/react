"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Save } from "lucide-react";
import { TemplateSchema } from "@/lib/schemas";
import type { Template } from "@/types/models";
import { api } from "@/lib/api";
import { safeJsonParse } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

function formatZodIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues
    .map((i) => `- ${i.path.map((p) => String(p)).join(".") || "(root)"}: ${i.message}`)
    .join("\n");
}

export function TemplatesPage() {
  const qc = useQueryClient();
  const toast = useToastStore();
  const [selectedId, setSelectedId] = useState<string>("");
  const [draftState, setDraftState] = useState<{ templateId: string; text: string }>({
    templateId: "",
    text: "",
  });
  const [errors, setErrors] = useState<string>("");

  const listQuery = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.templates.list(),
  });

  const templates = useMemo(() => listQuery.data?.templates ?? [], [listQuery.data]);
  const resolvedSelectedId = selectedId || templates[0]?.id || "";
  const selected = useMemo(
    () => templates.find((t) => t.id === resolvedSelectedId) ?? null,
    [templates, resolvedSelectedId],
  );
  const editorText =
    draftState.templateId === resolvedSelectedId
      ? draftState.text
      : selected
        ? JSON.stringify(selected, null, 2)
        : "";

  const saveMutation = useMutation({
    mutationFn: (tpl: Template) => api.templates.put(tpl.id, tpl),
    onSuccess: async () => {
      toast.push({ kind: "success", title: "保存しました" });
      await qc.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (e) => toast.push({ kind: "error", title: "保存に失敗", message: String(e) }),
  });

  const validate = () => {
    const parsed = safeJsonParse<unknown>(editorText);
    if (!parsed.ok) {
      setErrors(`JSON parse error: ${parsed.error}`);
      return null;
    }
    const z = TemplateSchema.safeParse(parsed.value);
    if (!z.success) {
      setErrors(formatZodIssues(z.error.issues));
      return null;
    }
    setErrors("");
    return z.data;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">テンプレ管理</div>
        <div className="text-sm text-zinc-600">Step定義をJSONとして編集し、Zodで検証して保存します。</div>
      </div>

      {listQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Spinner /> 読み込み中…
        </div>
      ) : listQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          取得失敗: {String(listQuery.error)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>テンプレ一覧</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {(listQuery.data?.templates ?? []).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                        onClick={() => {
                          setSelectedId(t.id);
                          setDraftState({ templateId: t.id, text: JSON.stringify(t, null, 2) });
                          setErrors("");
                        }}
                      className={[
                        "w-full rounded-lg border px-3 py-2 text-left",
                          t.id === resolvedSelectedId
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-200 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-900">{t.name}</div>
                          <div className="truncate font-mono text-xs text-zinc-600">{t.id}</div>
                        </div>
                        <Badge tone="zinc">{t.steps.length} steps</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>テンプレ編集</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const ok = validate();
                        if (ok) toast.push({ kind: "success", title: "バリデーションOK" });
                      }}
                    >
                      検証
                    </Button>
                    <Button
                      onClick={() => {
                        const ok = validate();
                        if (ok) saveMutation.mutate(ok);
                      }}
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                      保存
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {!selected ? (
                  <div className="text-sm text-zinc-600">テンプレを選択してください。</div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={editorText}
                      onChange={(e) => setDraftState({ templateId: resolvedSelectedId, text: e.target.value })}
                      className="min-h-[520px] font-mono text-xs"
                      spellCheck={false}
                    />
                    {errors ? (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-900">
                          <AlertTriangle className="h-4 w-4" />
                          バリデーションエラー
                        </div>
                        <pre className="whitespace-pre-wrap text-xs text-rose-900">{errors}</pre>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-600">
                        Zod検証に通るJSONのみ保存できます。idの不整合（URLのidと中身のidが違う）はエラーにします。
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

