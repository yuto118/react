export type CaseStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DONE"
  | "FAILED";

export type CasePriority = "LOW" | "MEDIUM" | "HIGH";

export type StepType = "DECISION" | "INPUT" | "CHECKLIST";
export type DecisionOption = "YES" | "NO" | "HOLD";

export type Fact = { key: string; value: string };

export type Case = {
  id: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  assignee: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  templateId: string;
  facts: Fact[];
  stepResults: StepResult[];
};

export type Template = {
  id: string;
  name: string;
  steps: Step[];
};

export type Step = {
  id: string;
  title: string;
  description?: string;
  type: StepType;
  required: boolean;
  decisionOptions?: DecisionOption[];
  inputSchema?: {
    fields: {
      name: string;
      label: string;
      type: "text" | "number" | "date" | "select";
      options?: string[];
      required?: boolean;
    }[];
  };
  checklistItems?: { id: string; label: string; required?: boolean }[];
};

export type StepResult = {
  stepId: string;
  decision?: DecisionOption;
  inputs?: Record<string, unknown>;
  checklist?: Record<string, boolean>;
  comment?: string;
  updatedAt: string;
};

export type AuditAction =
  | "OPEN_CASE"
  | "UPDATE_STEP"
  | "ASSIGN"
  | "CHANGE_STATUS"
  | "ADD_COMMENT"
  | "ROLLBACK"
  | "APPROVE"
  | "REJECT";

export type AuditLog = {
  id: string;
  caseId: string;
  actor: string;
  action: AuditAction;
  payload: unknown;
  createdAt: string;
};

export type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  if: {
    factKey: string;
    op: ">=" | ">" | "<=" | "<" | "==" | "!=";
    value: number;
  };
  then: {
    status: Extract<CaseStatus, "NEEDS_REVIEW" | "FAILED">;
  };
  createdAt: string;
};

