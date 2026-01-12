import { z } from "zod";

export const CaseStatusSchema = z.enum([
  "NEW",
  "IN_PROGRESS",
  "NEEDS_REVIEW",
  "APPROVED",
  "REJECTED",
  "DONE",
  "FAILED",
]);

export const CasePrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const DecisionOptionSchema = z.enum(["YES", "NO", "HOLD"]);
export const StepTypeSchema = z.enum(["DECISION", "INPUT", "CHECKLIST"]);

export const FactSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const StepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: StepTypeSchema,
  required: z.boolean(),
  decisionOptions: z.array(DecisionOptionSchema).optional(),
  inputSchema: z
    .object({
      fields: z.array(
        z.object({
          name: z.string().min(1),
          label: z.string().min(1),
          type: z.enum(["text", "number", "date", "select"]),
          options: z.array(z.string()).optional(),
          required: z.boolean().optional(),
        }),
      ),
    })
    .optional(),
  checklistItems: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        required: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const TemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  steps: z.array(StepSchema).min(1),
});

export const StepResultSchema = z.object({
  stepId: z.string().min(1),
  decision: DecisionOptionSchema.optional(),
  inputs: z.record(z.string(), z.unknown()).optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
  comment: z.string().optional(),
  updatedAt: z.string().min(1),
});

export const CaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: CaseStatusSchema,
  priority: CasePrioritySchema,
  assignee: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  templateId: z.string().min(1),
  facts: z.array(FactSchema),
  stepResults: z.array(StepResultSchema),
});

export const AuditActionSchema = z.enum([
  "OPEN_CASE",
  "UPDATE_STEP",
  "ASSIGN",
  "CHANGE_STATUS",
  "ADD_COMMENT",
  "ROLLBACK",
  "APPROVE",
  "REJECT",
]);

export const AuditLogSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  actor: z.string().min(1),
  action: AuditActionSchema,
  payload: z.unknown(),
  createdAt: z.string().min(1),
});

export const RuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  if: z.object({
    factKey: z.string().min(1),
    op: z.enum([">=", ">", "<=", "<", "==", "!="]),
    value: z.number(),
  }),
  then: z.object({
    status: z.enum(["NEEDS_REVIEW", "FAILED"]),
  }),
  createdAt: z.string().min(1),
});

export const PatchCaseBodySchema = z
  .object({
    assignee: z.string().nullable().optional(),
    status: CaseStatusSchema.optional(),
    facts: z.array(FactSchema).optional(),
    stepResult: z
      .object({
        stepId: z.string().min(1),
        decision: DecisionOptionSchema.optional(),
        inputs: z.record(z.string(), z.unknown()).optional(),
        checklist: z.record(z.string(), z.boolean()).optional(),
        comment: z.string().optional(),
      })
      .optional(),
    rollbackStepId: z.string().min(1).optional(),
    actor: z.string().min(1).default("demo_user"),
  })
  .strict();

