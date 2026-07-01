# Markdown PDF Viewer Sample

このファイルは、Markdown PDF Viewer の表示確認に使うためのサンプル文書です。
見出し、表、コードブロック、引用、チェックリスト、画像、リンクなど、PDF風プレビューで確認したい要素をまとめています。

## 1. 概要

Markdownで書いた設計メモや研究資料を、ブラウザ上で読みやすいPDF風レイアウトとして確認する想定です。

主な確認ポイントは以下です。

- 見出し階層が目次に反映されること
- 段落、箇条書き、番号付きリストが読みやすく表示されること
- 表とコードブロックが崩れずに表示されること
- 印刷時に余白や改ページが自然に扱われること

## 2. 想定システム

### 2.1 構成

| コンポーネント | 役割 | 備考 |
| --- | --- | --- |
| Content Script | Markdownページの検出 | GitHubページにボタンを追加 |
| Background Script | Viewerタブの起動 | URLと本文を受け渡す |
| Markdown Parser | MarkdownをHTMLへ変換 | GFM相当の記法に対応 |
| Viewer UI | PDF風プレビュー表示 | 印刷とPDF保存を行う |

### 2.2 処理フロー

1. ユーザーがMarkdown URLを開く
2. 拡張機能が対象ページを検出する
3. Markdown本文を取得する
4. HTMLへ変換する
5. PDF風CSSを適用して表示する
6. 必要に応じて印刷またはPDF保存する

## 3. コードブロック

JavaScriptの例です。

```javascript
function buildTitleFromUrl(url) {
  const pathname = new URL(url).pathname;
  const filename = pathname.split("/").pop() || "document.md";
  return filename.replace(/\.md$/i, "");
}

console.log(buildTitleFromUrl("https://example.com/docs/design.md"));
```

Verilogの例です。

```verilog
module blink (
    input  wire clk,
    input  wire rst_n,
    output reg  led
);
    reg [23:0] counter;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            counter <= 24'd0;
            led <= 1'b0;
        end else begin
            counter <= counter + 24'd1;
            if (counter == 24'd0) begin
                led <= ~led;
            end
        end
    end
endmodule
```

## 4. 引用とチェックリスト

> Markdown文書は、レビュー、共有、印刷までの流れを軽くできる形式です。
> PDF風プレビューにより、提出前の見た目確認もしやすくなります。

- [x] 見出しを確認する
- [x] 表を確認する
- [x] コードブロックを確認する
- [ ] 印刷プレビューを確認する
- [ ] PDF保存結果を確認する

## 5. リンクと画像

関連リンク:

- [GitHub](https://github.com/)
- [Markdown Guide](https://www.markdownguide.org/)

サンプル画像:

![Placeholder image](https://placehold.co/800x240/png?text=Markdown+PDF+Viewer)

## 6. 長めの本文

PDF風レイアウトでは、本文の読みやすさが重要です。行間、余白、見出しの間隔、表の幅、コードブロックの折り返しなどが適切であるほど、技術資料として扱いやすくなります。

研究資料や設計書では、表やコード片が頻繁に登場します。Markdownのままでは簡潔に管理できますが、共有や提出の場面では整った見た目も必要になります。この拡張機能は、その間をつなぐための軽量なビューアとして使えます。

## 7. まとめ

このサンプルをGitHubに置いてRaw URLで開くと、Markdown PDF Viewerの基本機能をまとめて確認できます。

```text
https://raw.githubusercontent.com/<user>/<repo>/<branch>/samples/sample-document.md
```
