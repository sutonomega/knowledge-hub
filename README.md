# Knowledge Hub

Knowledge Hub は、Markdown形式のメモを中心に、画像・動画・音声・PDFなど、さまざまなデータを一元管理できるWebアプリです。

## 主な機能（予定）

- Markdownノートの作成・編集
- 閲覧モード
- タグ管理
- 全文検索
- ノート間リンク
- バックリンク
- 画像・動画・音声・PDFの管理
- AI連携

## 現在使える機能

- ノート一覧、作成、編集、削除
- Markdown の編集、閲覧、分割表示
- タグ付けとタグ絞り込み
- タイトル、本文、タグの全文検索
- REST API によるノート、タグ、検索、最近更新ノートの取得

## データ保存

ノート本文は `storage/notes/*.md` に保存され、メタデータは `storage/index.json` に生成されます。`storage/` 配下の利用データは Git 管理対象外です。

## 開発

```bash
npm run dev
```

```bash
npm run lint
npm run build
```

## ライセンス

MIT License
