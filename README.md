# AI Corporation Orchestrator Platform

大規模SaaS向けマルチエージェントオーケストレーションプラットフォーム。AI CEO、CFO、HR、PMなどの複数エージェントが協調してプロジェクトとワークフローを管理します。

## 🏗️ アーキテクチャ

```
ai-corp-orchestrator-platform/
├── apps/
│   ├── api/              # Fastify + tRPC APIサーバー
│   │   ├── prisma/       # Prismaスキーマ & マイグレーション
│   │   └── src/
│   │       ├── lib/      # Prisma, Redis, Queue
│   │       └── trpc/     # tRPCルーター
│   ├── worker/           # BullMQ ワーカー
│   │   └── src/
│   │       └── processors/  # ワークフロー & エージェント処理
│   └── web/              # Next.js 管理ダッシュボード
│       └── src/
│           ├── app/      # App Router ページ
│           └── components/  # UIコンポーネント
└── packages/
    └── shared/           # 共通型定義 & ユーティリティ
        └── src/
            ├── types/    # Zodスキーマ
            └── lib/      # LLMクライアント, Logger, HTTPクライアント
```

### 技術スタック

**Backend (apps/api)**
- **Framework**: Fastify
- **API**: tRPC (type-safe API)
- **Database**: PostgreSQL + Prisma ORM
- **Cache & Queue**: Redis + BullMQ
- **Language**: TypeScript

**Worker (apps/worker)**
- **Queue**: BullMQ
- **LLM**: OpenAI GPT-4
- **External APIs**: Vector Knowledge API, Automation Recipes API

**Frontend (apps/web)**
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Client**: tRPC React Query

**Shared (packages/shared)**
- **Validation**: Zod
- **Logging**: Pino
- **HTTP Client**: Axios

**Infrastructure**
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Runtime**: Node.js 18+

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis 6+

### 1. 依存関係のインストール

```bash
# pnpmをインストール（まだの場合）
npm install -g pnpm

# 依存関係をインストール
pnpm install
```

### 2. 環境変数の設定

#### apps/api/.env
```bash
cp apps/api/.env.example apps/api/.env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_corp_orchestrator?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
OPENAI_API_KEY=sk-your-key-here

# 外部サービス（オプション）
VECTOR_KNOWLEDGE_API_URL=http://localhost:8001
AUTOMATION_RECIPES_API_URL=http://localhost:8002
```

#### apps/worker/.env
```bash
cp apps/worker/.env.example apps/worker/.env
# apps/apiと同じ設定
```

#### apps/web/.env.local
```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. データベースのセットアップ

```bash
# PostgreSQLを起動（Dockerの場合）
docker run -d \
  --name postgres-ai-corp \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_corp_orchestrator \
  -p 5432:5432 \
  postgres:14

# Redisを起動（Dockerの場合）
docker run -d \
  --name redis-ai-corp \
  -p 6379:6379 \
  redis:6

# Prismaマイグレーション
pnpm db:push

# シードデータを投入
pnpm db:seed
```

シード実行後、コンソールに表示される組織IDとユーザーIDを`apps/web/.env.local`に追加：

```env
NEXT_PUBLIC_DEFAULT_ORG_ID=clxxxxxxxx
NEXT_PUBLIC_DEFAULT_USER_ID=clxxxxxxxx
```

### 4. アプリケーションの起動

```bash
# すべてのアプリを開発モードで起動
pnpm dev
```

個別に起動する場合：

```bash
# APIサーバー
cd apps/api && pnpm dev

# Worker
cd apps/worker && pnpm dev

# Webダッシュボード
cd apps/web && pnpm dev
```

### 5. アクセス

- **Web Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **tRPC Endpoint**: http://localhost:3001/trpc
- **Prisma Studio**: `pnpm db:studio`

## 📊 データモデル

### コアエンティティ

1. **Organization** - マルチテナントのルートエンティティ
2. **User** - 組織メンバー（ADMIN, MEMBER, VIEWER）
3. **Project** - プロジェト管理
4. **Task** - タスク管理
5. **AgentProfile** - AIエージェントの設定とパーソナリティ
6. **AgentInstance** - エージェントの実行インスタンス
7. **Workflow** - ワークフロー定義（JSONベースのステップ）
8. **WorkflowRun** - ワークフローの実行履歴
9. **Job** - バックグラウンドジョブキュー
10. **ToolDefinition** - エージェントが使えるツール
11. **AuditLog** - 監査ログ

### エージェントロール

- **CEO** - 戦略的意思決定、ビジョン策定
- **CFO** - 財務分析、予算管理
- **CTO** - 技術戦略、アーキテクチャ
- **CMO** - マーケティング戦略
- **HR** - 人事管理、チームビルディング
- **PM** - プロジェクト計画、タスク管理
- **DEVELOPER** - 技術実装
- **DESIGNER** - デザイン
- **ANALYST** - データ分析
- **CUSTOM** - カスタムロール

## 🎯 ユースケース: 週次経営会議の自動化

### シナリオ

毎週月曜日の朝、AIエージェントチームが自動的に週次経営サマリーを作成し、人間の経営陣がレビューできるようにします。

### ワークフローステップ

1. **情報収集** (自動)
   - 過去1週間のプロジェクト更新を収集
   - ベクターデータベースから関連情報を検索

2. **財務分析** (AI CFO - Morgan)
   - 週次財務メトリクスを分析
   - 予算状況とROIを評価
   - 財務リスクと機会を特定

3. **プロジェクト進捗レビュー** (AI PM - Jordan)
   - 全プロジェクトの進捗状況を確認
   - ブロッカーと次のアクションを特定
   - リソース配分の推奨

4. **経営サマリー作成** (AI CEO - Alex)
   - CFOとPMの分析を統合
   - 戦略的洞察とアクションアイテムを抽出
   - エグゼクティブサマリーを作成

5. **人間レビュー** (手動)
   - 経営陣がサマリーをレビュー
   - 承認または修正要求
   - 最終決定を実行

### 実装例

```typescript
// Seed.tsに含まれる「Weekly Executive Summary」ワークフロー
{
  name: "Weekly Executive Summary",
  trigger: "SCHEDULED",
  schedule: "0 9 * * 1", // 毎週月曜9時
  steps: [
    {
      id: "step-1",
      name: "Gather Project Updates",
      action: "TOOL_CALL",
      config: {
        toolName: "vector_search",
        params: { query: "project updates last week", limit: 20 }
      }
    },
    {
      id: "step-2",
      name: "Financial Analysis",
      agentProfileId: "<CFO Agent ID>",
      action: "LLM_CALL",
      config: {
        prompt: "Analyze financial metrics and provide summary..."
      }
    },
    {
      id: "step-3",
      name: "Project Status Review",
      agentProfileId: "<PM Agent ID>",
      action: "LLM_CALL",
      config: {
        prompt: "Review project progress and identify blockers..."
      }
    },
    {
      id: "step-4",
      name: "Executive Summary",
      agentProfileId: "<CEO Agent ID>",
      action: "LLM_CALL",
      config: {
        prompt: "Create comprehensive executive summary..."
      }
    }
  ]
}
```

### 期待される成果

- **時間削減**: 手動レポート作成の80%削減
- **一貫性**: 標準化されたフォーマットとメトリクス
- **洞察**: AIによる深い分析と推奨事項
- **透明性**: すべてのステップとログが記録される
- **拡張性**: 新しいエージェントやステップを簡単に追加

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 型チェック
pnpm build

# フォーマット
pnpm format

# クリーン
pnpm clean

# データベース操作
pnpm db:generate    # Prismaクライアント生成
pnpm db:push        # スキーマをDBにプッシュ
pnpm db:migrate     # マイグレーション作成
pnpm db:seed        # シードデータ投入
pnpm db:studio      # Prisma Studio起動
```

## 🔐 認証（今後の実装）

現在は`x-organization-id`と`x-user-id`ヘッダーでの簡易認証を使用していますが、本番環境では以下を推奨：

- **NextAuth.js** - Web認証
- **JWT** - APIトークン
- **Magic Link** - パスワードレス認証
- **RBAC** - ロールベースアクセス制御

## 🚢 デプロイ

### Vercel (Web)
```bash
cd apps/web
vercel deploy
```

### Railway / Render (API + Worker)
- PostgreSQL + Redisアドオンを追加
- 環境変数を設定
- `apps/api`と`apps/worker`をそれぞれデプロイ

### Docker
```bash
# 今後のリリースでDockerfileとdocker-compose.ymlを追加予定
```

## 📚 API ドキュメント

tRPCを使用しているため、型安全なAPIクライアントが自動生成されます。

### 主要なルーター

- `organizations` - 組織管理
- `users` - ユーザー管理
- `projects` - プロジェクト管理
- `tasks` - タスク管理
- `agents` - エージェント設定
- `workflows` - ワークフロー管理
- `runs` - 実行履歴

### 使用例

```typescript
// Webアプリケーション内
import { trpc } from '@/lib/trpc';

// プロジェクト一覧を取得
const { data: projects } = trpc.projects.list.useQuery();

// ワークフロー実行
const executeMutation = trpc.workflows.execute.useMutation();
await executeMutation.mutateAsync({
  workflowId: 'xxx',
  initialContext: { ... }
});
```

## 🔧 カスタマイズ

### 新しいエージェントロールの追加

1. `apps/api/prisma/schema.prisma`の`AgentRole` enumに追加
2. `packages/shared/src/types/agent.ts`に型を追加
3. Seed スクリプトでサンプルエージェントを作成

### 新しいツールの追加

1. `ToolDefinition`を作成
2. `apps/worker/src/processors/workflow-processor.ts`の`executeToolCall`に実装を追加

### カスタムワークフローステップ

ワークフローは完全にJSON駆動で、以下のアクションタイプをサポート：

- `LLM_CALL` - LLM呼び出し
- `TOOL_CALL` - ツール実行
- `HUMAN_REVIEW` - 人間のレビュー待ち
- `CONDITIONAL` - 条件分岐
- `PARALLEL` - 並列実行

## 🤝 コントリビューション

プルリクエストを歓迎します！

## 📄 ライセンス

MIT License

## 🙏 謝辞

- OpenAI GPT-4
- Vercel (Next.js, Turborepo)
- Prisma
- tRPC
- BullMQ

---

**構築者**: AI Senior Architect
**バージョン**: 1.0.0
**最終更新**: 2024
