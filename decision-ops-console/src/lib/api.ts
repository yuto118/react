import type { AuditLog, Case, Rule, Template } from "@/types/models";

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  cases: {
    list: (params?: { q?: string; status?: string; assignee?: string; priority?: string }) => {
      const sp = new URLSearchParams();
      if (params?.q) sp.set("q", params.q);
      if (params?.status) sp.set("status", params.status);
      if (params?.assignee) sp.set("assignee", params.assignee);
      if (params?.priority) sp.set("priority", params.priority);
      const qs = sp.toString();
      return fetchJson<{ cases: Case[] }>(`/api/cases${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => fetchJson<{ case: Case }>(`/api/cases/${id}`),
    patch: (
      id: string,
      body: Partial<Pick<Case, "assignee" | "status" | "facts">> & {
        actor?: string;
        stepResult?: { stepId: string; decision?: "YES" | "NO" | "HOLD"; inputs?: Record<string, unknown>; checklist?: Record<string, boolean>; comment?: string };
        rollbackStepId?: string;
      },
    ) =>
      fetchJson<{ case: Case }>(`/api/cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
  templates: {
    list: () => fetchJson<{ templates: Template[] }>(`/api/templates`),
    get: (id: string) => fetchJson<{ template: Template }>(`/api/templates/${id}`),
    put: (id: string, template: Template) =>
      fetchJson<{ template: Template }>(`/api/templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(template),
      }),
  },
  logs: {
    list: (params?: { actor?: string; action?: string; caseId?: string; from?: string; to?: string }) => {
      const sp = new URLSearchParams();
      if (params?.actor) sp.set("actor", params.actor);
      if (params?.action) sp.set("action", params.action);
      if (params?.caseId) sp.set("caseId", params.caseId);
      if (params?.from) sp.set("from", params.from);
      if (params?.to) sp.set("to", params.to);
      const qs = sp.toString();
      return fetchJson<{ logs: AuditLog[] }>(`/api/logs${qs ? `?${qs}` : ""}`);
    },
    create: (body: Omit<AuditLog, "id" | "createdAt">) =>
      fetchJson<{ log: AuditLog }>(`/api/logs`, { method: "POST", body: JSON.stringify(body) }),
  },
  rules: {
    list: () => fetchJson<{ rules: Rule[] }>(`/api/rules`),
    create: (body: Omit<Rule, "id" | "createdAt">) =>
      fetchJson<{ rule: Rule }>(`/api/rules`, { method: "POST", body: JSON.stringify(body) }),
    remove: (id: string) => fetchJson<{ ok: true }>(`/api/rules/${id}`, { method: "DELETE" }),
  },
};

