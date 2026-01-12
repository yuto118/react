"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { Rule } from "@/types/models";
import { api } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

type FormValues = {
  name: string;
  factKey: string;
  op: Rule["if"]["op"];
  value: string;
  status: Rule["then"]["status"];
};

export function RulesPage() {
  const qc = useQueryClient();
  const toast = useToastStore();

  const rulesQuery = useQuery({
    queryKey: ["rules"],
    queryFn: () => api.rules.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: Omit<Rule, "id" | "createdAt">) => api.rules.create(body),
    onSuccess: async () => {
      toast.push({ kind: "success", title: "ルールを追加しました" });
      await qc.invalidateQueries({ queryKey: ["rules"] });
    },
    onError: (e) => toast.push({ kind: "error", title: "追加に失敗", message: String(e) }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.rules.remove(id),
    onSuccess: async () => {
      toast.push({ kind: "info", title: "削除しました" });
      await qc.invalidateQueries({ queryKey: ["rules"] });
    },
    onError: (e) => toast.push({ kind: "error", title: "削除に失敗", message: String(e) }),
  });

  const form = useForm<FormValues>({
    defaultValues: { name: "", factKey: "amount", op: ">=", value: "1000000", status: "NEEDS_REVIEW" },
  });

  const onSubmit = form.handleSubmit((v) => {
    const num = Number(v.value);
    if (!Number.isFinite(num)) {
      toast.push({ kind: "error", title: "value は数値で入力してください" });
      return;
    }
    createMutation.mutate({
      name: v.name || `rule: ${v.factKey} ${v.op} ${v.value}`,
      enabled: true,
      if: { factKey: v.factKey, op: v.op, value: num },
      then: { status: v.status },
    });
    form.reset({ ...v, name: "" });
  });

  const rules = rulesQuery.data?.rules ?? [];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">ルール管理</div>
        <div className="text-sm text-zinc-600">
          Case更新時に Facts を評価し、条件に合う場合は status を自動変更します（MVP: if-then 1条件）。
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ルール追加</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="mb-1 text-xs font-semibold text-zinc-700">name</div>
              <Input {...form.register("name")} placeholder="金額が一定以上ならレビュー必須…" />
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">factKey</div>
              <Input {...form.register("factKey")} placeholder="amount" />
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">op</div>
              <Select {...form.register("op")}>
                <option value=">=">&gt;=</option>
                <option value=">">&gt;</option>
                <option value="<=">&lt;=</option>
                <option value="<">&lt;</option>
                <option value="==">==</option>
                <option value="!=">!=</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">value</div>
              <Input {...form.register("value")} inputMode="numeric" />
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">then.status</div>
              <Select {...form.register("status")}>
                <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                <option value="FAILED">FAILED</option>
              </Select>
            </div>
            <div className="md:col-span-12 flex justify-end">
              <Button type="submit" disabled={createMutation.isPending}>
                追加
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ルール一覧</CardTitle>
        </CardHeader>
        <CardBody>
          {rulesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Spinner /> 読み込み中…
            </div>
          ) : rulesQuery.isError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              取得失敗: {String(rulesQuery.error)}
            </div>
          ) : rules.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-600">ルールがありません。</div>
          ) : (
            <div className="space-y-2">
              {rules.map((r) => (
                <div key={r.id} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">{r.name}</div>
                      <div className="mt-1 text-xs text-zinc-600 font-mono">{r.id}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <Badge tone="sky">
                          if {r.if.factKey} {r.if.op} {r.if.value}
                        </Badge>
                        <Badge tone="amber">then {r.then.status}</Badge>
                        <Badge tone={r.enabled ? "emerald" : "zinc"}>{r.enabled ? "enabled" : "disabled"}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeMutation.mutate(r.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

