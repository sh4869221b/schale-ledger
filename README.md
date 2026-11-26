# シャーレ育成手帳

『ブルーアーカイブ』の日本語の個人用育成・編成台帳です。生徒を名前や属性で探し、利用者ごとの育成状況と総力戦・合同火力演習の6枠の編成を記録できます。

- [設計と受け入れ条件](docs/design-v2.md)
- [日本版の生徒マスタ277件と出典](docs/student-data.md)
- [Cloudflare へのデプロイと切り戻し](docs/deploy.md)

## 開発とテスト

Node.js 24 と npm を使います。

```sh
npm ci
npm exec -- playwright-core install chromium
npm run check
npm test
npm run db:migrate:local
npm run dev
```

標準の開発 Worker は `http://localhost:3000/healthz` で確認できます。認証後の画面は、テスト専用の署名鍵と使い捨ての D1 を使って `npm test` で検証します。リリースと同じ認証経路で手動確認する場合は、Cloudflare Access を設定したプレビューを使用してください。開発機に Chromium がある場合は `PLAYWRIGHT_CHROMIUM_EXECUTABLE` にパスを設定できます。

`src/index.ts` が画面とフォームを処理し、`src/ledger.ts` と `src/rules.ts` が永続化と業務ルールを扱います。D1 マイグレーションは `migrations/` にあります。GitHub Actions は CI を実行します。
