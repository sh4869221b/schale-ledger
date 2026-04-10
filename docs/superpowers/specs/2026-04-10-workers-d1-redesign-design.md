# Workers + D1 Redesign Design

## Goal
- `schale-ledger` を Cloudflare Pages + Neon/Postgres 前提から、Cloudflare Workers + D1 前提へ全面移行する。
- UI は Tailwind CSS v4 + shadcn-svelte を基盤に再設計し、Mission Control 型の MVP を提供する。
- 初回リリースは一括切替とし、既存データ移行は含めず、D1 は新規初期化前提とする。

## Approved Scope
- 対象スタック
  - SvelteKit
  - Cloudflare Workers
  - Cloudflare Vite plugin
  - Tailwind CSS v4
  - shadcn-svelte
  - Drizzle ORM
  - D1
- 含むもの
  - UI 再設計
  - API 再設計
  - 認証見直し
  - リポジトリ構成再編
  - CI / deploy / IaC 整理
- 含まないもの
  - Neon/Postgres 既存データの D1 への移送
  - MCP の初回復元
  - モバイル最適化の作り込み

## Product Direction
- UI 方向は `Mission Control` を採用する。
- 初見で状況把握と次アクションが分かるダッシュボードを中心とする。
- 生徒管理、育成進捗、編成管理を横断する導線を最優先にする。
- 初回は MVP として以下を対象にする。
  - Dashboard
  - Students list/detail
  - Progress edit
  - Teams list/edit

## Architecture

### Runtime
- 単一の SvelteKit アプリを Cloudflare Workers 上で実行する。
- Cloudflare Vite plugin を使い、ローカル開発と Workers 実行環境の差を小さくする。
- Cloudflare Pages 前提の build/deploy 設定は廃止する。
- リリース方式は単一 cutover とし、本番で旧新構成を並行稼働させない。
- 本書に記載する Phase 1-4 は実装順序の整理であり、本番段階的リリースを意味しない。

### Repository Structure
- 現在の `services/app` + `packages/domain|application|infrastructure|contracts` 依存構成は維持しない。
- 新構成は、Workers/D1 と MVP 実装に適した責務単位へ再編する。

```text
apps/
  web/
    src/
      routes/
      lib/
        server/
        client/
        features/
packages/
  core/
  db/
  ui/
infrastructure/
  wrangler/
  github/
docs/
```

### Responsibility Split
- `apps/web`
  - SvelteKit app 本体
  - UI / server load / actions / API endpoints
  - 認証の入口と request ごとの user 解決
- `packages/ui`
  - shadcn-svelte ベースの共通 UI
  - Tailwind v4 トークンと UI primitive
- `packages/db`
  - Drizzle schema
  - D1 migration / seed
  - D1 binding を受ける接続 helper
- `packages/core`
  - 生徒、育成進捗、編成の最小コアモデル
  - バリデーション、表示や永続化に依存しないルール
- `infrastructure`
  - Wrangler 設定
  - GitHub Actions
  - 環境差分、セットアップ、デプロイ手順

### Source-to-Target Migration Map
- `services/app`
  - `apps/web` へ移す。
  - UI、routes、server load/actions、API endpoints の新実装先とする。
- `packages/domain` + `packages/application`
  - `packages/core` へ再編する。
  - 既存の型・ルール・ユースケースを、MVP に必要な最小単位へ統合する。
- `packages/infrastructure` + `db/schema`
  - `packages/db` へ再編する。
  - Postgres 実装は持ち込まず、D1/Drizzle 向けに作り直す。
- `packages/contracts`
  - UI/API の境界に必要なものだけ `apps/web` または `packages/core` に吸収する。
  - 旧 REST/MCP 互換のための DTO は原則そのまま残さない。
- `docs/spec/*`
  - 旧構成前提の仕様として凍結する。
  - 新構成の正本は `docs/superpowers/specs/*` と後続の implementation plan に移す。

### Old-to-New Decommission Order
1. 新 `apps/web` と `packages/*` が build/test/deploy 可能になるまで旧構成は参照用で保持する。
2. 新 Workers/D1 MVP が完成し、cutover チェックを通過した後に Pages/Neon/Hyperdrive 設定を削除する。
3. 最後に旧 `services/app` と未使用 package/docs を整理する。

### Design Principles
- UI flow first を採用し、MVP の画面導線に必要な server logic を先に定義する。
- 過度な層分割は避け、`app / ui / db / core` の 4 軸を基本にする。
- 旧コードは移行完了まで参照用に保持し、新構成完成後に整理する。

## Data and Persistence

### Database Strategy
- Drizzle ORM は継続利用する。
- ただし Postgres 方言依存を捨て、D1(SQLite 系) 前提で schema と query を再定義する。
- これは移植ではなく、D1 向け再設計として扱う。

### Data Model Direction
- MVP では以下を主要テーブルとする。
  - `users`
  - `students`
  - `student_progress`
  - `teams`
  - `team_members`
- 補助テーブルは MVP で本当に必要なものだけ残す。`team_mode_rules` や `progress_caps` は初期導入するかを再評価する。

### D1 Constraints and Conventions
- `pgTable` や Postgres 専用型は利用しない。
- `ilike`、接続プール、Hyperdrive、`pg` ドライバ依存は除去する。
- ID は UUID 固定にこだわらず、D1 で扱いやすい `TEXT` ベース一意 ID を許容する。
- 日時は ISO 8601 文字列で統一する。
- クエリは単純な filter / sort / pagination を優先し、複雑な DB 方言依存を避ける。

### Migration and Seed
- `packages/db` 配下に D1 用 migration と seed を集約する。
- 初回リリースは新規初期化前提なので、D1 を作成後に migration + seed を適用できればよい。
- 既存 Neon/Postgres データの移送はこの設計の対象外とする。

## Auth and Authorization

### Auth Direction
- 認証は現行をそのまま維持せず、Workers 実行環境に合わせて整理する。
- Node サーバ前提の実装や長寿命接続依存を持ち込まない。
- 認証は `apps/web` server 側に集約し、SvelteKit の request lifecycle に自然に乗る構成にする。
- MVP では Cloudflare Access を外部 IdP として継続利用し、Workers で `cf-access-jwt-assertion` を検証する。

### Session Model
- `hooks.server` で Cloudflare Access JWT を検証し、`sub` を主キー、`email` を補助キーとして user を解決する。
- 初回アクセス時は `users` テーブルに user を自動作成する。
- Access JWT 検証後、アプリ独自の署名付き session cookie を発行する。
- session は D1 の `users` と紐づく `session_id` を `HttpOnly`, `Secure`, `SameSite=Lax` cookie で保持する。
- session 有効期限は短めに設定し、各 request で rolling refresh する。
- logout は cookie 破棄 + session 無効化で扱う。
- Access JWT が失効、または session が無効な場合は再認証へ戻す。

### Authorization Boundary
- request ごとに user を解決し、操作対象が user 境界を越えないことを `apps/web` server 層で保証する。
- `packages/core` は user 前提のルールを扱ってよいが、HTTP や Cookie には依存しない。
- 越境アクセスは UI 上は not-found 相当、API 上は統一エラー envelope で返す。
- login/logout/account lifecycle の責務は `apps/web/src/lib/server/auth` に閉じ込める。

## API and Server Boundaries

### API Strategy
- 既存 REST/MCP の互換維持は目的にしない。
- MVP の画面導線に必要な server capability を基準に API を再設計する。
- UI からしか使わない操作は API 化せず、server load / form actions を優先する。
- 外部呼び出しが必要なものだけ `+server.ts` に切り出す。

### MVP Server Capabilities
- Dashboard 用集約データ取得
- 生徒一覧 / 生徒詳細取得
- 進捗取得 / 更新
- 編成一覧 / 作成 / 編集

### MVP Route and Contract Matrix
- Dashboard
  - `GET /` + `+page.server.ts`
  - server load で summary cards、recent teams、attention items を返す。
- Students
  - `GET /students` + `+page.server.ts`
  - query: `q`, `school`, `role`, `position`, `page`
  - response: UI 表示用の list model
  - `GET /students/[studentId]` + `+page.server.ts`
  - response: student detail + current progress snapshot
- Progress
  - `POST /students/[studentId]/progress` は form action を優先する。
  - request: level / rarity / bond / skill levels / equipment tiers / memo などの form fields
  - response: 成功時は同ページ再表示、失敗時は field errors を返す。
- Teams
  - `GET /teams` + `+page.server.ts`
  - response: team list model
  - `POST /teams` は form action
  - `POST /teams/[teamId]` は form action で name/memo/member slots を更新
  - `GET /api/teams/[teamId]` は外部参照が必要になった場合のみ追加する。

### API Exposure Rules
- 画面専用の読み書きは server load / form actions で完結させる。
- `+server.ts` を使うのは以下に限定する。
  - 外部クライアントから呼ぶ必要がある
  - JSON が UI 以外でも再利用される
  - route action よりも HTTP 契約を明示したい
- 初回 MVP では公開 JSON API を最小化し、画面実装の複雑性を優先して下げる。

### Boundaries in `apps/web`
- `routes/+page(.server).ts`
  - 画面表示向けデータ取得と compose
- `routes/**/+server.ts`
  - 明示的に外へ出す API
- `lib/server/auth`
  - session 解決、認証、認可
- `lib/server/db`
  - D1 / Drizzle 接続生成
- `lib/features/*`
  - dashboard / students / progress / teams の use-case 相当

### Error Handling
- UI は SvelteKit の failure / error に寄せる。
- API は `code/message/details` 形式の JSON error envelope に統一する。
- Workers 実行時の失敗は構造化ログで観測できるようにする。

## UI and Design System

### Design Direction
- Tailwind CSS v4 + shadcn-svelte で新しい管理画面体験を作る。
- `Mission Control` を基調に、情報密度は高めだが階層は明確な UI を目指す。
- デスクトップ中心に最適化し、初回 MVP ではモバイル調整を後回しにする。

### Primary Screens
1. Dashboard
2. Students list/detail
3. Progress edit
4. Teams list/edit

### Shared UI System
- `packages/ui` に以下の共通部品を集約する。
  - Button
  - Input
  - Form
  - Dialog
  - Sheet
  - Tabs
  - Table
  - Badge
  - Card
  - Command
  - Sidebar 系 UI
- 画面固有のスタイルをベタ書きせず、primitive / composition を優先する。

### UX Guidelines
- ダッシュボード上部に状況要約を置く。
- 長いフォームは section 分割する。
- 一覧では table と card を役割で使い分ける。
- 保存中、保存済み、入力エラーを見分けやすくする。

## Delivery, CI, and Deployment

### Commit Policy
- 実装は task 単位で進め、各 task 完了時に小さく独立したコミットを作る。
- 1 コミット 1 目的を原則とし、基盤整備、DB、認証、UI、CI の変更を不必要に混在させない。
- formatting のみの変更とロジック変更は可能な限り分離する。
- cutover 前の大きな統合コミットは避け、レビュー可能な粒度を維持する。

### Local Development
- SvelteKit + Cloudflare Vite plugin でローカル開発する。
- Wrangler / D1 をローカルでも使い、本番との差を減らす。
- 開発用変数の定義場所と責務を整理する。

### CI
- GitHub Actions で少なくとも以下を実行する。
  - install
  - lint
  - typecheck
  - test
  - build
  - migration 整合性確認（必要なら）

### Deployment
- Cloudflare Pages deploy は廃止し、Workers deploy に統一する。
- Wrangler 設定で環境ごとの D1 binding と変数を管理する。
- `dev` / `prod` の差分は構成ファイルで明示する。

### IaC and Configuration
- 少なくとも Wrangler 設定、D1 binding、必要な変数一覧、migration 手順は文書化する。
- 完全な IaC 化は後続フェーズでもよいが、再現可能なセットアップを優先する。

## Migration Plan

### Cutover Policy
- 本番切替は 1 回のみ行う。
- 本番で Pages/Neon 系と Workers/D1 系を併用する期間は設けない。
- Phase 1-3 の成果物は、cutover 前に dev 環境で積み上げて検証する。

### Phase 1: Foundation
- repo 構成を再編する。
- Workers + Cloudflare Vite plugin + Tailwind v4 + shadcn-svelte を導入する。
- `packages/db` に D1/Drizzle 基盤を作る。
- CI ひな型を整える。

### Phase 2: MVP Features
- Dashboard を実装する。
- Students list/detail を実装する。
- Progress edit を実装する。
- Teams list/edit を実装する。
- 認証の最小実装を入れる。

### Phase 3: Hardening
- エラーハンドリングとロギングを整える。
- UX を調整する。
- README / setup / deploy 手順を更新する。
- Workers/D1 で build と deploy を検証する。

### Phase 4: Cutover
- 新構成を本番として切り替える。
- Cloudflare Pages / Neon / Hyperdrive 前提を削除する。
- 旧構成の不要コードと docs を整理する。

### Cutover Verification Checklist
- Workers build が CI とローカルで一致して成功する。
- D1 migration + seed が空 DB に対して再現可能である。
- MVP 主要導線（dashboard / students / progress / teams）が dev 環境で通る。
- 認証、session refresh、logout が Workers 上で確認できる。
- Wrangler の dev/prod binding と secrets 一覧が更新済みである。

### Rollback Policy
- cutover 当日は旧 Pages/Neon 設定を削除せず保持し、新 Workers 本番確認後に削除する。
- 重大障害時は DNS/production route を旧構成へ戻せる状態を保つ。
- 旧構成のコード削除は、Workers 本番確認後の別変更として扱う。

## Risks
- D1 方言に合わせた schema/query の再設計コスト
- 認証方式の見直しに伴う実装判断
- UI 再設計による工数増大
- 旧構成削除のタイミングを誤るリスク

## Success Criteria
- Workers への deploy が可能である。
- D1 migration / seed が再現可能である。
- MVP の主要導線が新 UI で動作する。
- README、CI、Wrangler 設定が新構成に一致する。
- Pages / Neon / Hyperdrive 前提が repo から除去される。

## Notes
- この設計は全面移行のための青写真であり、実装時にはさらにタスク単位へ分解する。
- コミットは未実施。必要なら別途ユーザー指示の上で行う。
