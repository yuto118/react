"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import type { Case } from "@/types/models";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useCaseListStore } from "@/stores/caseListStore";
import { useToastStore } from "@/stores/toastStore";
import { useUserStore } from "@/stores/userStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

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

export function CasesPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const { actor } = useUserStore();
  const toast = useToastStore();
  const { filters, setFilter, reset } = useCaseListStore();

  const casesQuery = useQuery({
    queryKey: ["cases", filters],
    queryFn: () => api.cases.list(filters),
  });

  const assignMutation = useMutation({
    mutationFn: (id: string) => api.cases.patch(id, { assignee: actor, actor }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cases"] });
      toast.push({ kind: "success", title: "割り当てました", message: `assignee=${actor}` });
    },
    onError: (e) => toast.push({ kind: "error", title: "割り当てに失敗", message: String(e) }),
  });

  const columns = useMemo<ColumnDef<Case>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: (ctx) => <span className="font-mono text-xs text-zinc-600">{ctx.getValue() as string}</span>,
      },
      {
        header: "タイトル",
        accessorKey: "title",
        cell: (ctx) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-zinc-900">{ctx.getValue() as string}</div>
          </div>
        ),
      },
      {
        header: "ステータス",
        accessorKey: "status",
        cell: (ctx) => <Badge tone={statusTone(ctx.getValue() as Case["status"])}>{ctx.getValue() as string}</Badge>,
      },
      {
        header: "優先度",
        accessorKey: "priority",
        cell: (ctx) => <Badge tone={priorityTone(ctx.getValue() as Case["priority"])}>{ctx.getValue() as string}</Badge>,
      },
      {
        header: "担当",
        accessorKey: "assignee",
        cell: (ctx) => (
          <span className="text-sm text-zinc-700">{(ctx.getValue() as string | null) ?? "—"}</span>
        ),
      },
      {
        header: "更新",
        accessorKey: "updatedAt",
        cell: (ctx) => <span className="text-sm text-zinc-600">{formatDateTime(ctx.getValue() as string)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                assignMutation.mutate(row.original.id);
              }}
              disabled={assignMutation.isPending}
            >
              <UserPlus className="h-4 w-4" />
              自分に割り当て
            </Button>
          </div>
        ),
      },
    ],
    [assignMutation],
  );

  const data = casesQuery.data?.cases ?? [];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">案件一覧</div>
          <div className="text-sm text-zinc-600">検索/フィルタで絞り込み、行クリックで詳細へ。</div>
        </div>
        <Button variant="ghost" onClick={reset}>
          リセット
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>フィルタ</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-700">検索</div>
              <Input
                value={filters.q}
                onChange={(e) => setFilter("q", e.target.value)}
                placeholder="caseId / title"
              />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-700">ステータス</div>
              <Select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="">すべて</option>
                <option value="NEW">NEW</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="DONE">DONE</option>
                <option value="FAILED">FAILED</option>
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-700">担当</div>
              <Select value={filters.assignee} onChange={(e) => setFilter("assignee", e.target.value)}>
                <option value="">すべて</option>
                <option value="UNASSIGNED">未割り当て</option>
                <option value="demo_user">demo_user</option>
                <option value="alice">alice</option>
                <option value="bob">bob</option>
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-700">優先度</div>
              <Select value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
                <option value="">すべて</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>一覧</CardTitle>
        </CardHeader>
        <CardBody>
          {casesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Spinner /> 読み込み中…
            </div>
          ) : casesQuery.isError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              読み込みに失敗しました: {String(casesQuery.error)}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-600">
              該当する案件がありません。
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full min-w-[920px] border-separate border-spacing-0">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th
                          key={h.id}
                          className="border-b px-3 py-2 text-left text-xs font-semibold text-zinc-600"
                        >
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-zinc-50"
                      onClick={() => router.push(`/cases/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="border-b px-3 py-2 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

