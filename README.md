# Decision Ops Console（MVP）

判断・承認・監査ログの汎用コンソールです。  
Next.js(App Router) + TypeScript + Tailwind + Zustand + TanStack Query/Table + React Hook Form + Zod で構成しています。

> このリポジトリは **アプリ本体が `decision-ops-console/` 配下**にあります。

## 起動手順

```bash
cd decision-ops-console
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます（`/cases` にリダイレクトされます）。

## ルーティング

- `/cases` : 案件一覧（検索/フィルタ、行クリックで詳細、"自分に割り当て"）
- `/cases/[id]` : 案件詳細（三分割、ステッパー、ロールバック、承認/却下、右に監査ログ）
- `/settings/templates` : テンプレ管理（JSON編集 + Zodバリデーション + 保存）
- `/settings/rules` : ルール管理（簡易 if-then 追加/削除）
- `/logs` : 監査ログ検索（期間/actor/action/caseId、caseIdから案件へ）

## API（Route Handlers / in-memory mock）

必須:
- `GET /api/cases`
- `GET /api/cases/[id]`
- `PATCH /api/cases/[id]`（assignee/status/facts/stepResult/rollbackStepId）
- `GET /api/templates`
- `GET /api/templates/[id]`
- `PUT /api/templates/[id]`
- `GET /api/logs`
- `POST /api/logs`

追加（MVPの `/settings/rules` 用）:
- `GET /api/rules`
- `POST /api/rules`
- `DELETE /api/rules/[id]`

## ディレクトリ構成（主要）

`decision-ops-console/src` 配下:

- `app/` : App Router（pages + route handlers）
  - `app/api/**/route.ts` : モックAPI（in-memory）
  - `app/cases/**` / `app/settings/**` / `app/logs/**`
- `types/` : 型（`Case` / `Template` / `Step` / `StepResult` / `AuditLog` / `Rule`）
- `lib/`
  - `api.ts` : APIクライアント（fetch wrapper + typed）
  - `schemas.ts` : Zodスキーマ（テンプレJSON検証、PATCH body検証）
  - `utils.ts` : `cn()` などの共通ユーティリティ
- `stores/` : Zustand（UI状態/フィルタ/トースト/ステッパー）
- `components/`
  - `components/ui/*` : 自作UI primitives（Button/Badge/Card/Dialog/Toaster 等）
  - `components/cases/*` : 一覧/詳細（ステッパー含む）
  - `components/templates/*` : テンプレ編集
  - `components/settings/*` : ルール管理
  - `components/logs/*` : 監査ログ検索
- `server/mockDb.ts` : in-memory DB（初期データseed、ログ追加、ルール評価）

## 主要コンポーネントの責務（抜粋）

- `components/app/app-shell.tsx`
  - グローバルナビとページ共通レイアウト
- `components/cases/cases-page.tsx`
  - TanStack Table で案件一覧、フィルタ状態（Zustand）とQueryの整合
- `components/cases/case-detail-page.tsx`
  - 三分割レイアウト、ステッパー（Zustandで現在ステップ）、Stepタイプ別UI、ロールバック/承認/却下、ログ表示
- `components/templates/templates-page.tsx`
  - JSONエディタ（テキスト）+ Zod検証 + 保存（PUT）
- `components/logs/logs-page.tsx`
  - 監査ログの検索条件（Zustand）+ 一覧（Table）+ Caseへの導線

## 今後の拡張案

- 永続化（DB）: `server/mockDb.ts` を Repository 層（Prisma等）に置換し、Route Handlersを薄く
- 承認フロー拡張: actor権限、並行レビュー、差戻し（ワークフロー状態遷移の明示化）
- 監査ログ強化: payloadのスキーマ化、差分表示、エクスポート
- テンプレ拡張: バージョニング、ステップ依存、条件分岐、入力型の追加
- ルールエンジン: 複数条件/AND/OR、テスト可能な評価器、シミュレーションUI

