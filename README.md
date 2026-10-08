# GREAT HOLLOW ROUTER

スマホ向け・オフライン優先のプロトタイプです。

## ファイル
- index.html : UI
- style.css : モバイルUI
- app.js : シード判定、12ルート、回収済み、NEXT、タイマー、模式マップ
- manifest.webmanifest : PWA
- sw.js : オフラインキャッシュ
- README.md : 説明

## データ方針
結晶シード判定と4結晶ルートは、プレイヤー検証済みのGreat Hollow 4-crystal route spreadsheetを基準にしています。
ゲーム内の公式座標は未取得なので、マップは「方向関係を示す模式マップ」です。結晶の正確な地理座標を推測していません。

## PWA
静的ファイルをHTTPSで配信してください。Safariで開き「共有 → ホーム画面に追加」で利用できます。
ローカルfile://ではService Worker/PWAが動かないため、PWAとしてはHTTPS配信が必要です。

## 注意
Seed FinderのデータセットはゲームApp Ver. 1.03.2を対象としています。
確認できた公式HotfixではApp Ver. 1.03.2 / Regulation Ver. 1.03.5です。
今後の更新で結晶配置・判定が変わっていないことは保証していません。
