# 卒業制作サイトのワイヤープロトタイプ

既存のReact + Vite + TypeScript環境で作成した、白・グレー・枠線による動くワイヤー。CSSは通常のCSS、ルーティングはReact Routerを使用する。`参考/` の5枚の画像を画面構成の正本としている。

## 起動・検証

```powershell
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

`http://127.0.0.1:5173/` を開く。PowerShellでは `npm.ps1` の実行制限を変更せず、`npm.cmd` を使う。

別のターミナルで以下を実行する。

```powershell
npm.cmd run build
npm.cmd run lint
node scripts/check-wireframe.mjs
```

- `build`: TypeScriptの型チェック後、Viteで `dist/` にビルドする。
- `lint`: アプリと検証スクリプトのESLint検査。
- ブラウザ検証: 起動済みの上記URLに接続し、専用プロファイルのheadless Chromeで画面操作とスクリーンショットを確認する。Windowsの標準的なChrome配置以外では `CHROME_PATH` で実行ファイルを指定できる。
- 検証用Chromeは終了時に停止する。専用プロファイルはGit対象外の `node_modules/.cache/wireframe-browser/` に保持し、普段のブラウザプロファイルは使用しない。
- 開発サーバーは起動したターミナルで `Ctrl+C` により停止する。

## 実装ページ

| URL | 内容 |
| --- | --- |
| `/` | Talk。100dvhでbodyを固定。左にキャラクター表示枠、右に会話履歴と入力欄。履歴だけ内部スクロールする。 |
| `/profile` | キャラクター表示枠、基本情報・性格・好き嫌い・話し方、紹介文と詳細情報。すべて未設定。 |
| `/activities` | 明示的なサンプル3件、カテゴリ絞り込み、仮詳細ダイアログ。実績や日付の創作はしない。 |
| `/voice` | 音声サンプル3件の枠。再生ボタンは無効。 |
| `/goods` | 商品4件の枠、無効な外部移動ボタン、Talkへの戻りリンク。実URL・価格は未設定。 |

全ページでナビゲーションは `Talk / Profile / Activities / Voice / Goods`。Home項目は設けない。About / Credits / Privacyは未設定内容を示す仮ダイアログに接続している。Talk以外は通常のページスクロールを許可する。

Talkは初期会話例2件を表示する。クリックまたはEnterで送信するとユーザーメッセージと固定回答を追加し、履歴の末尾へスクロールする。空白だけの送信を防ぎ、入力は最大1,000文字。日本語変換中のEnterでは送信しない。入力内容はReactのテキストとして表示する。

会話はフロントエンドのメモリ内だけに存在し、Talkから離れるか再読み込みすると初期会話に戻る。永続保存・外部送信は行わない。

## ブラウザ確認の証跡

`artifacts/wireframe/verification.json` に最新の検証結果を保存する。1440×900で各ページの遷移・表示・直接再読み込み、Talkのbody固定と履歴スクロール、送信・固定回答、IME・空入力、Activitiesの仮操作、Voice/Goodsの無効状態を検証する。390×844でも全ページの横幅、Talkの入力欄と送信ボタンを確認する。

スクリーンショット（通常ページは全体撮影のため画像高が900pxを超える場合がある）:

- [Talk](artifacts/wireframe/talk.png)
- [Profile](artifacts/wireframe/profile.png)
- [Activities](artifacts/wireframe/activities.png)
- [Voice](artifacts/wireframe/voice.png)
- [Goods](artifacts/wireframe/goods.png)
- [Talkの履歴スクロール](artifacts/wireframe/talk-scrolled.png)
- [Talkのモバイル表示](artifacts/wireframe/talk-mobile.png)

## 主なファイル

- `src/App.tsx`: ルートとTalkのbody固定切り替え。
- `src/main.tsx`: React / BrowserRouterの入口。
- `src/navigation.ts`: ナビ項目とパスの定義。
- `src/components/Wireframe.tsx`: 共通ヘッダー・フッター・表示枠。
- `src/pages/TalkPage.tsx`: 固定モックのチャット。
- `src/pages/ContentPages.tsx`: Profile / Activities / Voice / Goods / 未知URLの表示。
- `src/App.css`, `src/index.css`: ワイヤー配置、最低限のレスポンシブ、フォーカス表示。
- `index.html`: 日本語設定、サイトタイトル。
- `eslint.config.js`: アプリ・検証スクリプトの検査範囲。
- `scripts/check-wireframe.mjs`: 依存追加なしのChrome検証。
- `.gitignore`: ビルド結果、依存パッケージ、ローカルエージェント設定、環境変数・鍵ファイルを除外。
- `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`: 既存の初期構築環境を維持。

## 未実装・今回使用しないもの

完成デザイン、キャラクターの詳細設定・素材、グッズ画像・実商品情報・外部URL、音声ファイル・再生、About / Credits / Privacyの正式原稿は未実装。Cloudflare、AI API、Node.js APIサーバーは使用しない。公開デプロイは行わない。

GitHubバックアップ先は `https://github.com/uiharuyuki/momoka_ai`。非公開設定は変更しない。今回のコード・設定・参照画像・検証証跡だけを登録し、環境変数、認証情報、個人情報、ローカルエージェント設定、未使用のViteテンプレート素材は含めない。
