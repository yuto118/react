import type { AuditAction, AuditLog, Case, Rule, Template } from "@/types/models";
import { nowIso, randomId } from "@/lib/utils";

type DbState = {
  cases: Case[];
  templates: Template[];
  logs: AuditLog[];
  rules: Rule[];
};

declare global {
  var __decisionOpsDb: DbState | undefined;
}

function seedTemplates(): Template[] {
  const invoice: Template = {
    id: "tpl_invoice_review",
    name: "Invoice Review",
    steps: [
      {
        id: "s1_open",
        title: "初期判断",
        description: "請求の基本妥当性を判断します。",
        type: "DECISION",
        required: true,
        decisionOptions: ["YES", "NO", "HOLD"],
      },
      {
        id: "s2_amount",
        title: "金額入力",
        description: "請求金額などの入力（または確認）を行います。",
        type: "INPUT",
        required: true,
        inputSchema: {
          fields: [
            { name: "amount", label: "金額", type: "number", required: true },
            { name: "currency", label: "通貨", type: "select", options: ["JPY", "USD"], required: true },
            { name: "invoiceDate", label: "請求日", type: "date", required: true },
          ],
        },
      },
      {
        id: "s3_vendor",
        title: "取引先確認",
        type: "DECISION",
        required: true,
        decisionOptions: ["YES", "NO", "HOLD"],
      },
      {
        id: "s4_checklist",
        title: "必要書類チェック",
        type: "CHECKLIST",
        required: true,
        checklistItems: [
          { id: "i1", label: "発注書", required: true },
          { id: "i2", label: "検収書", required: true },
          { id: "i3", label: "請求書PDF", required: true },
        ],
      },
      {
        id: "s5_final",
        title: "最終判断",
        description: "承認/却下の前に最終判断を記録します。",
        type: "DECISION",
        required: true,
        decisionOptions: ["YES", "NO", "HOLD"],
      },
    ],
  };

  const itAccess: Template = {
    id: "tpl_it_access",
    name: "IT Access Request",
    steps: [
      {
        id: "a1_reason",
        title: "申請理由",
        type: "INPUT",
        required: true,
        inputSchema: {
          fields: [
            { name: "system", label: "対象システム", type: "select", options: ["GitHub", "Jira", "AWS"], required: true },
            { name: "role", label: "希望ロール", type: "text", required: true },
            { name: "expiresAt", label: "期限", type: "date" },
          ],
        },
      },
      {
        id: "a2_manager",
        title: "上長承認",
        type: "DECISION",
        required: true,
        decisionOptions: ["YES", "NO", "HOLD"],
      },
      {
        id: "a3_security",
        title: "セキュリティ確認",
        type: "CHECKLIST",
        required: true,
        checklistItems: [
          { id: "c1", label: "MFA設定", required: true },
          { id: "c2", label: "利用規約同意", required: true },
        ],
      },
      {
        id: "a4_final",
        title: "最終承認",
        type: "DECISION",
        required: true,
        decisionOptions: ["YES", "NO", "HOLD"],
      },
    ],
  };

  return [invoice, itAccess];
}

function seedCases(templates: Template[]): Case[] {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const titles = [
    "請求書レビュー: ACME株式会社",
    "請求書レビュー: Foo商事",
    "ITアクセス申請: GitHub",
    "ITアクセス申請: AWS",
    "請求書レビュー: Bar物流",
    "請求書レビュー: Baz製造",
    "ITアクセス申請: Jira",
    "請求書レビュー: Quxデザイン",
    "ITアクセス申請: GitHub (外部委託)",
    "請求書レビュー: Neko Trading",
  ];
  const statuses: Case["status"][] = [
    "NEW",
    "IN_PROGRESS",
    "NEEDS_REVIEW",
    "NEW",
    "IN_PROGRESS",
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "NEW",
    "FAILED",
  ];
  const priorities: Case["priority"][] = ["LOW", "MEDIUM", "HIGH", "LOW", "MEDIUM", "HIGH", "MEDIUM", "HIGH", "LOW", "MEDIUM"];
  const assignees: (string | null)[] = [null, "demo_user", "alice", null, "bob", "demo_user", "alice", null, "bob", null];
  const templateIds = [
    templates[0]!.id,
    templates[0]!.id,
    templates[1]!.id,
    templates[1]!.id,
    templates[0]!.id,
    templates[0]!.id,
    templates[1]!.id,
    templates[0]!.id,
    templates[1]!.id,
    templates[0]!.id,
  ];

  return titles.map((title, i) => {
    const createdAt = iso(now - (10 - i) * 24 * 60 * 60 * 1000);
    const updatedAt = iso(now - (10 - i) * 3 * 60 * 60 * 1000);
    const templateId = templateIds[i]!;

    const facts =
      templateId === "tpl_invoice_review"
        ? [
            { key: "vendor", value: ["ACME", "Foo", "Bar", "Baz", "Qux", "Neko"][i % 6]! },
            { key: "amount", value: String([120000, 980000, 4500000, 250000, 1600000, 75000][i % 6]!) },
            { key: "date", value: iso(now - i * 2 * 24 * 60 * 60 * 1000).slice(0, 10) },
          ]
        : [
            { key: "requester", value: ["sato", "tanaka", "suzuki", "yamada"][i % 4]! },
            { key: "system", value: ["GitHub", "Jira", "AWS"][i % 3]! },
            { key: "reason", value: "業務上必要なため" },
          ];

    return {
      id: `case_${String(i + 1).padStart(3, "0")}`,
      title,
      status: statuses[i]!,
      priority: priorities[i]!,
      assignee: assignees[i]!,
      createdAt,
      updatedAt,
      templateId,
      facts,
      stepResults: [],
    } satisfies Case;
  });
}

function seedRules(): Rule[] {
  const createdAt = nowIso();
  return [
    {
      id: "rule_amount_over_1000000",
      name: "金額が 1,000,000 以上なら NEEDS_REVIEW",
      enabled: true,
      if: { factKey: "amount", op: ">=", value: 1_000_000 },
      then: { status: "NEEDS_REVIEW" },
      createdAt,
    },
  ];
}

function seedLogs(cases: Case[]): AuditLog[] {
  const base = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const actorPool = ["demo_user", "alice", "bob", "system"];
  const actions: AuditAction[] = ["OPEN_CASE", "ASSIGN", "CHANGE_STATUS", "UPDATE_STEP", "ADD_COMMENT"];
  const logs: AuditLog[] = [];
  for (let i = 0; i < 40; i++) {
    const c = cases[i % cases.length]!;
    logs.push({
      id: randomId("log"),
      caseId: c.id,
      actor: actorPool[i % actorPool.length]!,
      action: actions[i % actions.length]!,
      payload: { seed: true, n: i },
      createdAt: new Date(base + i * 60 * 60 * 1000).toISOString(),
    });
  }
  return logs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function initDb(): DbState {
  const templates = seedTemplates();
  const cases = seedCases(templates);
  const rules = seedRules();
  const logs = seedLogs(cases);
  return { templates, cases, logs, rules };
}

export function getDb(): DbState {
  if (!globalThis.__decisionOpsDb) {
    globalThis.__decisionOpsDb = initDb();
  }
  return globalThis.__decisionOpsDb;
}

export function addLog(params: Omit<AuditLog, "id" | "createdAt"> & { createdAt?: string }) {
  const db = getDb();
  const log: AuditLog = {
    id: randomId("log"),
    createdAt: params.createdAt ?? nowIso(),
    caseId: params.caseId,
    actor: params.actor,
    action: params.action,
    payload: params.payload,
  };
  db.logs.unshift(log);
  return log;
}

export function evaluateRulesForCase(c: Case) {
  const db = getDb();
  const facts = new Map(c.facts.map((f) => [f.key, f.value]));
  for (const rule of db.rules) {
    if (!rule.enabled) continue;
    const raw = facts.get(rule.if.factKey);
    const num = raw == null ? NaN : Number(raw);
    if (Number.isNaN(num)) continue;

    const ok =
      rule.if.op === ">="
        ? num >= rule.if.value
        : rule.if.op === ">"
          ? num > rule.if.value
          : rule.if.op === "<="
            ? num <= rule.if.value
            : rule.if.op === "<"
              ? num < rule.if.value
              : rule.if.op === "=="
                ? num === rule.if.value
                : num !== rule.if.value;

    if (ok) {
      return rule.then.status;
    }
  }
  return null;
}

