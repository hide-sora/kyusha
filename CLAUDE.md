# 旧車サミット2026 - CLAUDE.md

## プロジェクト概要
水戸道楽TV YouTuber 旧車サミット2026 のイベント専用Webアプリ。
2026年4月26日(日) モビリティリゾートもてぎ南コースにて開催。来場者約2,150人。

## 技術スタック
- **フレームワーク**: Astro 5 (SSR, Node.js adapter)
- **UI**: React 19 (Islands Architecture)
- **スタイリング**: UnoCSS (preset-wind3)
- **バックエンド**: PocketBase (別インスタンス, ポート8093予定)
- **アイコン**: Phosphor Icons (@iconify-json/ph) via UnoCSS Icons preset

## 開発コマンド
```bash
npm run dev        # 開発サーバー起動
npm run build      # astro check + astro build
npx astro build    # ビルドのみ (check スキップ)
```

## デプロイ
- **サーバー**: Kagoya VPS (133.18.160.234)
- **SSH**: ubuntu@133.18.160.234
- **アプリポート**: 4324
- **PocketBase**: 8093
- **PM2プロセス名**: `kyusha-summit`
- **デプロイ**: `powershell -ExecutionPolicy Bypass -File .\deploy.ps1`
- **注意**: `pm2 restart kyusha-summit` のみ使用。`pm2 restart all` は絶対禁止

## PocketBase コレクション
### auction_items (出品アイテム)
title, description, image, youtuber_name, start_price, current_price, status(upcoming/live/ended), start_time

### auction_bids (入札)
item(relation→auction_items), amount, bidder_name, device_id

### car_votes (車投票)
car_number (^[A-E]\d{2}$), device_id

## 主要ディレクトリ
- `src/components/` - React コンポーネント (Auction/, Vote/, Schedule/, Map/, common/)
- `src/pages/` - Astro ページ
- `src/data/` - 静的データ (schedule.ts, zones.ts)
- `src/lib/` - PocketBase クライアント、デバイスID
- `public/map/` - SVGマップアセット

## デザイン方針
- ダークベース + ゴールド/クロームのレトロモダンテーマ
- モバイルファースト（来場者はスマホで使う）
- フォント: Zen Maru Gothic (本文) + Oswald (見出し・数字)

## エリア情報
- A: 水戸道楽TV (50台) / B: GT-R R32-R34 (25台) / C: 旧車〜1989 (87台)
- D: ネオクラ・ファミリー 1990〜 (71台) / E: スーパーカー・輸入車 (14台)
