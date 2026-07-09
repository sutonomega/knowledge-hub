# API

## 概要

Knowledge Hub は REST API を採用し、フロントエンドとバックエンドを分離した構成とする。

API は JSON を基本フォーマットとし、メディアファイルは multipart/form-data で送受信する。

---

# エンドポイント一覧

| Method | Path            | 説明             |
| ------ | --------------- | ---------------- |
| GET    | /api/notes      | ノート一覧を取得 |
| POST   | /api/notes      | ノートを作成     |
| GET    | /api/notes/{id} | ノートを取得     |
| PUT    | /api/notes/{id} | ノートを更新     |
| DELETE | /api/notes/{id} | ノートを削除     |

---

| Method | Path             | 説明     |
| ------ | ---------------- | -------- |
| GET    | /api/search      | 全文検索 |
| GET    | /api/tags        | タグ一覧 |
| GET    | /api/tags/{name} | タグ検索 |

---

| Method | Path            | 説明                 |
| ------ | --------------- | -------------------- |
| POST   | /api/files      | ファイルアップロード |
| GET    | /api/files/{id} | ファイル取得         |
| DELETE | /api/files/{id} | ファイル削除         |

---

| Method | Path                | 説明               |
| ------ | ------------------- | ------------------ |
| GET    | /api/backlinks/{id} | バックリンク取得   |
| GET    | /api/recent         | 最近更新したノート |

---

# リクエスト形式

## JSON

```json
{
  "title": "Markdown",
  "content": "# Hello",
  "tags": ["Markdown", "Programming"]
}
```

---

# レスポンス形式

```json
{
  "id": 1,
  "title": "Markdown",
  "content": "# Hello",
  "tags": ["Markdown", "Programming"],
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

# ステータスコード

| Code | 説明                  |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

# 設計方針

- REST API を採用する
- URL はリソース指向で設計する
- JSON を基本フォーマットとする
- API はステートレスに保つ
- 将来的な認証機能追加を考慮した設計とする
- API の後方互換性を意識する

---

# 将来追加予定

- 認証 API
- AI API
- 同期 API
- WebSocket API
- バージョン履歴 API
- プラグイン API
