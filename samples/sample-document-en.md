# Markdown PDF Viewer Sample

This file is a sample document for checking Markdown PDF Viewer output.
It includes headings, tables, code blocks, blockquotes, checklists, images, and links that are useful when testing the PDF-style preview.

## 1. Overview

Markdown PDF Viewer is intended to make design notes, research documents, and technical references easier to read in a browser.

Key points to check:

- Heading levels are reflected in the table of contents
- Paragraphs, bullet lists, and numbered lists are easy to read
- Tables and code blocks keep their layout
- Print preview handles margins and page breaks cleanly

## 2. Example System

### 2.1 Components

| Component | Role | Notes |
| --- | --- | --- |
| Content Script | Detects Markdown pages | Adds buttons to GitHub pages |
| Background Script | Opens the viewer tab | Passes URLs and document content |
| Markdown Parser | Converts Markdown to HTML | Supports common GFM syntax |
| Viewer UI | Shows the PDF-style preview | Handles printing and PDF saving |

### 2.2 Processing Flow

1. The user opens a Markdown URL
2. The extension detects the supported page
3. The Markdown body is loaded
4. The Markdown is converted to HTML
5. PDF-style CSS is applied
6. The user prints or saves the result as PDF

## 3. Code Blocks

JavaScript example:

```javascript
function buildTitleFromUrl(url) {
  const pathname = new URL(url).pathname;
  const filename = pathname.split("/").pop() || "document.md";
  return filename.replace(/\.md$/i, "");
}

console.log(buildTitleFromUrl("https://example.com/docs/design.md"));
```

Verilog example:

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

## 4. Blockquote and Checklist

> Markdown documents are lightweight to review, share, and print.
> A PDF-style preview also makes it easier to check the final appearance before submission.

- [x] Check headings
- [x] Check tables
- [x] Check code blocks
- [ ] Check print preview
- [ ] Check the saved PDF

## 5. Links and Image

Related links:

- [GitHub](https://github.com/)
- [Markdown Guide](https://www.markdownguide.org/)

Sample image:

![Placeholder image](https://placehold.co/800x240/png?text=Markdown+PDF+Viewer)

## 6. Longer Text

Readability matters in a PDF-style layout. Line height, margins, heading spacing, table width, and code wrapping all affect whether a technical document is comfortable to read.

Research notes and design documents often include tables and code snippets. Markdown keeps those documents easy to maintain, while a polished preview helps when the document needs to be shared, submitted, or archived as a PDF.

## 7. Summary

Place this sample in a GitHub repository and open the Raw URL to check the core Markdown PDF Viewer behavior.

```text
https://raw.githubusercontent.com/<user>/<repo>/<branch>/samples/sample-document-en.md
```
