# Database

## 概要

Knowledge Hub は、Markdownファイルをデータの主体とし、データベースには検索や管理に必要なメタデータのみを保存する。

この設計により、データの可搬性・保守性・拡張性を高める。

---

# データ構成

```text
Markdown Files
        │
        ▼
+----------------+
|   Note (.md)   |
+----------------+
        │
        ▼
+----------------+
|   Database     |
|  (Metadata)    |
+----------------+
        │
        ▼
Search / Tags / Links
```

---

# Notes

Markdownノートの情報を管理する。

| Column     | Type     | Description              |
| ---------- | -------- | ------------------------ |
| id         | UUID     | ノートID                 |
| title      | TEXT     | タイトル                 |
| slug       | TEXT     | URL用名称                |
| path       | TEXT     | Markdownファイルの保存先 |
| created_at | DATETIME | 作成日時                 |
| updated_at | DATETIME | 更新日時                 |

---

# Tags

タグ一覧。

| Column | Type |
| ------ | ---- |
| id     | UUID |
| name   | TEXT |

---

# NoteTags

ノートとタグの関連付け。

| Column  | Type |
| ------- | ---- |
| note_id | UUID |
| tag_id  | UUID |

---

# Links

ノート同士のリンク。

| Column         | Type |
| -------------- | ---- |
| source_note_id | UUID |
| target_note_id | UUID |

---

# Files

添付ファイル。

| Column     | Type     |
| ---------- | -------- |
| id         | UUID     |
| note_id    | UUID     |
| name       | TEXT     |
| path       | TEXT     |
| type       | TEXT     |
| size       | INTEGER  |
| created_at | DATETIME |

---

# Search Index

検索高速化用インデックス。

| Column  | Type |
| ------- | ---- |
| note_id | UUID |
| content | TEXT |

---

# 将来追加予定

## Users

ログイン機能用。

## Versions

ノート履歴。

## AI Embeddings

ベクトル検索。

## Favorites

お気に入り。

## Recent Notes

最近開いたノート。

---

# 保存構成

```text
storage/
├── notes/
│   ├── note-a.md
│   ├── note-b.md
│   └── ...
│
├── media/
│   ├── images/
│   ├── videos/
│   ├── audio/
│   ├── pdf/
│   └── files/
│
└── thumbnails/
```

---

# 設計方針

- Markdownを唯一の情報源（Single Source of Truth）とする
- データベースはメタデータ管理を担当する
- メディアファイルはファイルシステムで管理する
- UUIDを主キーとして使用する
- データベースはキャッシュ・インデックスとしての役割も持つ
- 将来的にSQLiteからPostgreSQLへ移行しやすい設計とする
