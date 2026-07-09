# Coding Rules

## 基本方針

- 読みやすさを最優先とする
- シンプルな実装を選択する
- 必要になるまで機能を追加しない（YAGNI）
- 同じコードを繰り返さない（DRY）
- 小さく作り、小さく改善する

---

# コード品質

- 可読性を最優先とする
- 保守しやすいコードを書く
- 過度な最適化は行わない
- コメントよりコードで意図を表現する

---

# 命名規則

## ファイル

- kebab-case を使用する

例

```text
note-list.tsx
markdown-editor.tsx
tag-list.tsx
```

---

## React Component

- PascalCase

例

```text
NoteList
MarkdownEditor
SearchBar
```

---

## 関数

- camelCase

例

```ts
createNote();
deleteNote();
searchNotes();
```

---

## 変数

- camelCase

例

```ts
noteList;
searchKeyword;
selectedNote;
```

---

## 定数

- UPPER_SNAKE_CASE

例

```ts
MAX_FILE_SIZE;
DEFAULT_PAGE_SIZE;
```

---

# ディレクトリ構成

```text
src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
└── styles/
```

---

# コンポーネント設計

- 1つのコンポーネントは1つの責務を持つ
- コンポーネントは可能な限り小さくする
- ロジックとUIを分離する
- 共通UIは components に配置する
- 機能単位のコードは features に配置する

---

# API

- REST API を採用する
- エラーレスポンスは統一する
- HTTPステータスコードを適切に利用する

---

# エラーハンドリング

- エラーを握りつぶさない
- ユーザーが理解できるメッセージを表示する
- ログを残す

---

# Git

## ブランチ

```text
main
develop
feature/*
fix/*
```

---

## コミットメッセージ

```text
feat: ノート作成機能を追加

fix: タグ検索の不具合を修正

refactor: API処理を整理

docs: READMEを更新

style: コード整形

test: テストを追加
```

---

# TypeScript

- `any` は使用しない
- 型を明示する
- 型定義は `types` にまとめる
- `enum` より Union Type を優先する

---

# CSS

- Tailwind CSS を基本とする
- インラインスタイルは使用しない
- 共通スタイルを優先する

---

# テスト

- 重要なロジックにはテストを書く
- バグ修正時は再発防止のテストを追加する

---

# AIとの開発ルール

- AIが生成したコードは必ずレビューする
- 動作を理解してから採用する
- 不要なコードは削除する
- 生成コードをそのまま信用しない

---

# ドキュメント

機能追加・仕様変更を行った場合は、必要に応じて以下のドキュメントも更新する。

- README.md
- concept.md
- roadmap.md
- architecture.md
- api.md
- database.md
- ui.md
- spec.md

---

# 開発理念

> **シンプルに設計し、継続的に改善する。**

コードは「書くこと」よりも「読みやすく、長く保守できること」を重視する。
