# sd-webui-add-download-image-button

Stable Diffusion WebUI 用の拡張機能です。生成した画像をワンクリックでダウンロードできるボタンを追加します。

## 機能

- **ギャラリーのダウンロードボタン**: txt2img / img2img タブの出力ギャラリー下のボタン行に、ダウンロードボタン（⭳）を追加します
- **モーダルのダウンロードボタン**: 画像をクリックして開くモーダル（ライトボックス）内にもダウンロードボタンを追加します
- ギャラリーで選択中の画像、またはモーダルで表示中の画像を、ボタンクリックでブラウザのダウンロードとして保存できます

## インストール

1. Stable Diffusion WebUI の `extensions` フォルダにこのリポジトリをクローンまたは配置します

```bash
cd extensions
git clone https://github.com/mckey-dev/sd-webui-add-download-image-button.git
```

2. WebUI を再起動するか、設定の「拡張機能」から「拡張機能の一覧を更新」を実行します

## 使い方

1. txt2img または img2img で画像を生成します
2. ギャラリーでダウンロードしたい画像を選択します（クリックで選択）
3. ギャラリー下のボタン行にある ⭳ ボタンをクリックします
4. 画像がブラウザのダウンロードフォルダに保存されます

モーダル表示中（画像をクリックして拡大表示している状態）でも、モーダル内の ⭳ ボタンから同様にダウンロードできます。

## ファイル構成

```
sd-webui-add-download-image-button/
├── javascript/
│   └── sd-webui-add-download-image-button.js  # メインのJavaScript
├── scripts/
│   └── main.py                                 # 拡張スクリプト
├── style.css                                   # ボタンのスタイル
└── README.md
```

## ライセンス

MIT License
