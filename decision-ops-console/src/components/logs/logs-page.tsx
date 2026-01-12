"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { AuditLog } from "@/types/models";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useToastStore } from "@/stores/toastStore";
import { useLogsFiltersStore } from "@/stores/logsFiltersStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export function LogsPage() {
  const toast = useToastStore();
  const { filters, set, reset } = useLogsFiltersStore();

  const logsQuery = useQuery({
    queryKey: ["logs", "search", filters],
    queryFn: () => api.logs.list({ ...filters, from: filters.from || undefined, to: filters.to || undefined }),
  });

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        header: "日時",
        accessorKey: "createdAt",
        cell: (ctx) => <span className="text-sm text-zinc-700">{formatDateTime(ctx.getValue() as string)}</span>,
      },
      {
        header: "actor",
        accessorKey: "actor",
        cell: (ctx) => <span className="font-mono text-xs text-zinc-700">{ctx.getValue() as string}</span>,
      },
      {
        header: "action",
        accessorKey: "action",
        cell: (ctx) => <Badge tone="zinc">{ctx.getValue() as string}</Badge>,
      },
      {
        header: "caseId",
        accessorKey: "caseId",
        cell: (ctx) => {
          const id = ctx.getValue() as string;
          if (!id || id === "system") return <span className="text-sm text-zinc-600">{id || "—"}</span>;
          return (
            <Link href={`/cases/${id}`} className="text-sm font-medium text-sky-700 hover:underline">
              {id}
            </Link>
          );
        },
      },
      {
        header: "payload",
        accessorKey: "payload",
        cell: (ctx) => (
          <pre className="max-w-[520px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-zinc-600">
            {JSON.stringify(ctx.getValue(), null, 0)}
          </pre>
        ),
      },
    ],
    [],
  );

  const data = logsQuery.data?.logs ?? [];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">監査ログ検索</div>
          <div className="text-sm text-zinc-600">ユーザー/期間/アクション/Caseで絞り込み、Caseへドリルダウンします。</div>
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">from</div>
              <Input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">to</div>
              <Input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <div className="mb-1 text-xs font-semibold text-zinc-700">actor</div>
              <Input value={filters.actor} onChange={(e) => set("actor", e.target.value)} placeholder="demo_user" />
            </div>
            <div className="md:col-span-3">
              <div className="mb-1 text-xs font-semibold text-zinc-700">action</div>
              <Select value={filters.action} onChange={(e) => set("action", e.target.value)}>
                <option value="">すべて</option>
                <option value="OPEN_CASE">OPEN_CASE</option>
                <option value="UPDATE_STEP">UPDATE_STEP</option>
                <option value="ASSIGN">ASSIGN</option>
                <option value="CHANGE_STATUS">CHANGE_STATUS</option>
                <option value="ADD_COMMENT">ADD_COMMENT</option>
                <option value="ROLLBACK">ROLLBACK</option>
                <option value="APPROVE">APPROVE</option>
                <option value="REJECT">REJECT</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="mb-1 text-xs font-semibold text-zinc-700">caseId</div>
              <Input
                value={filters.caseId}
                onChange={(e) => set("caseId", e.target.value)}
                placeholder="case_001"
                onBlur={() => toast.push({ kind: "info", title: "フィルタを適用しました" })}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>一覧</CardTitle>
        </CardHeader>
        <CardBody>
          {logsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Spinner /> 読み込み中…
            </div>
          ) : logsQuery.isError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              取得失敗: {String(logsQuery.error)}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-600">ログがありません。</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-0">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((h) => (
                        <th key={h.id} className="border-b px-3 py-2 text-left text-xs font-semibold text-zinc-600">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="border-b px-3 py-2 align-top">
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

