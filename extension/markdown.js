const MarkdownPdf = (() => {
  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const slugify = (value, used) => {
    const base =
      value
        .toLowerCase()
        .trim()
        .replace(/<[^>]+>/g, "")
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-") || "section";
    let slug = base;
    let index = 2;
    while (used.has(slug)) {
      slug = `${base}-${index}`;
      index += 1;
    }
    used.add(slug);
    return slug;
  };

  const safeUrl = (value) => {
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? escapeHtml(url.href) : "#";
    } catch {
      return "#";
    }
  };

  const inline = (text) => {
    let html = escapeHtml(text);
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => `<img alt="${alt}" src="${safeUrl(src)}">`);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => `<a href="${safeUrl(href)}" target="_blank" rel="noreferrer">${label}</a>`);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");
    return html;
  };

  const parseTable = (lines, start) => {
    if (start + 1 >= lines.length) return null;
    const header = lines[start];
    const divider = lines[start + 1];
    const split = (line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
    const headers = split(header);
    const dividers = split(divider);
    const isDivider = (cell) => /^:?-+:?$/.test(cell);

    if (
      headers.length < 2 ||
      dividers.length !== headers.length ||
      !header.includes("|") ||
      !dividers.every(isDivider)
    ) {
      return null;
    }

    const alignments = dividers.map((cell) => {
      const left = cell.startsWith(":");
      const right = cell.endsWith(":");
      if (left && right) return "center";
      if (right) return "right";
      if (left) return "left";
      return "";
    });
    const cellStyle = (index) => (alignments[index] ? ` style="text-align: ${alignments[index]}"` : "");
    const normalizeRow = (row) => {
      const normalized = row.slice(0, headers.length);
      while (normalized.length < headers.length) normalized.push("");
      return normalized;
    };
    const rows = [];
    let index = start + 2;
    while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
      rows.push(normalizeRow(split(lines[index])));
      index += 1;
    }
    const thead = `<thead><tr>${headers.map((cell, cellIndex) => `<th${cellStyle(cellIndex)}>${inline(cell)}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${rows
      .map((row) => `<tr>${row.map((cell, cellIndex) => `<td${cellStyle(cellIndex)}>${inline(cell)}</td>`).join("")}</tr>`)
      .join("")}</tbody>`;
    return { html: `<table>${thead}${tbody}</table>`, next: index };
  };

  const parse = (markdown) => {
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    const toc = [];
    const usedSlugs = new Set();
    let paragraph = [];
    let listType = null;
    let inCode = false;
    let code = [];
    let codeLang = "";
    let inBlockquote = false;

    const closeParagraph = () => {
      if (!paragraph.length) return;
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    };

    const closeList = () => {
      if (!listType) return;
      html.push(`</${listType}>`);
      listType = null;
    };

    const closeBlockquote = () => {
      if (!inBlockquote) return;
      html.push("</blockquote>");
      inBlockquote = false;
    };

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        closeParagraph();
        closeList();
        closeBlockquote();
        if (inCode) {
          html.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(code.join("\n"))}</code></pre>`);
          inCode = false;
          code = [];
          codeLang = "";
        } else {
          inCode = true;
          codeLang = trimmed.slice(3).trim();
        }
        continue;
      }

      if (inCode) {
        code.push(line);
        continue;
      }

      if (!trimmed) {
        closeParagraph();
        closeList();
        closeBlockquote();
        continue;
      }

      const table = parseTable(lines, index);
      if (table) {
        closeParagraph();
        closeList();
        closeBlockquote();
        html.push(table.html);
        index = table.next - 1;
        continue;
      }

      const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
      if (heading) {
        closeParagraph();
        closeList();
        closeBlockquote();
        const level = heading[1].length;
        const text = heading[2].replace(/\s+#*$/, "");
        const id = slugify(text, usedSlugs);
        html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
        if (level <= 3) toc.push({ level, text, id });
        continue;
      }

      if (/^[-*_]{3,}$/.test(trimmed)) {
        closeParagraph();
        closeList();
        closeBlockquote();
        html.push("<hr>");
        continue;
      }

      const quote = /^>\s?(.*)$/.exec(line);
      if (quote) {
        closeParagraph();
        closeList();
        if (!inBlockquote) {
          html.push("<blockquote>");
          inBlockquote = true;
        }
        html.push(`<p>${inline(quote[1])}</p>`);
        continue;
      }

      const unordered = /^\s*[-*+]\s+(.+)$/.exec(line);
      const ordered = /^\s*\d+\.\s+(.+)$/.exec(line);
      if (unordered || ordered) {
        closeParagraph();
        closeBlockquote();
        const nextType = unordered ? "ul" : "ol";
        if (listType !== nextType) {
          closeList();
          html.push(`<${nextType}>`);
          listType = nextType;
        }
        html.push(`<li>${inline((unordered || ordered)[1])}</li>`);
        continue;
      }

      closeList();
      closeBlockquote();
      paragraph.push(trimmed);
    }

    closeParagraph();
    closeList();
    closeBlockquote();
    if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);

    return { html: html.join("\n"), toc };
  };

  return { parse };
})();
