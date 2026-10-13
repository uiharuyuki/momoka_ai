# 小鳥遊ももか 卒業制作｜公開ワイヤーフレーム

AI VTuber「小鳥遊ももか」公式サイトの**デザイン確認専用**Reactワイヤーフレーム。公開サイトでは実際のAI、Cloudflare Worker、D1、Node relay、認証情報を使用しない。

- 公開URL: https://uiharuyuki.github.io/momoka_ai/
- 実Chat確認: https://momoka-cloudflare-poc.nirayuki15.workers.dev/
- 正本: このGitHubリポジトリの`main`

## Talkの確認手順

1. 最初は中央のキャラクター枠と下部入力欄を表示する。
2. 質問例を選ぶか、文字を入力して送信する。
3. PCではキャラクター57%／会話43%の左右構成へ変化する。
4. スマートフォンではキャラクター上部30%／会話下部70%の縦構成へ変化する。
5. 返信はレイアウト確認用の固定文で、入力内容を外部へ送信・保存しない。

ナビゲーションからProfile、Activities、Voice、Goodsも確認できる。未確定情報はプレースホルダーとして表示し、実績・商品・音声などを創作しない。

## ローカル起動

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

`http://127.0.0.1:5173/momoka_ai/`を開く。

## 検証

```bash
npm test
npm run build
npm run lint
npm audit --audit-level=high
```

`main`へpushするとGitHub Actionsがテストとビルドを実行し、GitHub Pagesへ公開する。

## 公開範囲

この公開リポジトリには、静的UI、CSS、公開可能な資料、検証コードだけを置く。以下は置かない。

- APIキー、トークン、パスワード、環境変数
- `.wrangler`、Cloudflare Worker／D1の内部設定
- Node relay、Quick Tunnel、ローカルQwenの接続情報
- 会話ログ、個人情報、ローカル認証状態

完成版のAI Chatはデザイン承認後に別管理の本体コードへ統合し、Workers URLへ反映する。公開ワイヤーフレームを本体の正本にはしない。
