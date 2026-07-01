const titleEl = document.getElementById("documentTitle");
const contentEl = document.getElementById("content");
const messageEl = document.getElementById("message");
const tocEl = document.getElementById("tocList");
const reloadButton = document.getElementById("reloadButton");
const printButton = document.getElementById("printButton");

const params = new URLSearchParams(location.search);

const setMessage = (message, isError = false) => {
  messageEl.textContent = message || "";
  messageEl.classList.toggle("error", isError);
};

const titleFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const name = parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname;
    return decodeURIComponent(name.replace(/\.(md|markdown)$/i, ""));
  } catch {
    return "Markdown Document";
  }
};

const openPrintDialog = () => {
  window.print();
};

const render = (markdown, title) => {
  const parsed = MarkdownPdf.parse(markdown);
  titleEl.textContent = title || "Markdown Document";
  document.title = `${titleEl.textContent} - Markdown PDF Viewer`;
  contentEl.innerHTML = parsed.html;
  tocEl.innerHTML = parsed.toc.length
    ? parsed.toc.map((item) => `<a class="level-${item.level}" href="#${item.id}">${item.text}</a>`).join("")
    : `<span class="empty">${t("noHeadings")}</span>`;
  setMessage("");

  if (params.get("print") === "1") {
    setTimeout(openPrintDialog, 250);
  }
};

const loadFromUrl = async (url) => {
  titleEl.textContent = titleFromUrl(url);
  setMessage(t("loadingMarkdown"));
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(t("fetchFailed", [`${response.status} ${response.statusText}`]));
  }
  const markdown = await response.text();
  render(markdown, titleFromUrl(url));
};

const loadLocal = () =>
  new Promise((resolve, reject) => {
    chrome.storage.local.get("localMarkdown", ({ localMarkdown }) => {
      if (!localMarkdown?.content) {
        reject(new Error(t("localMarkdownMissing")));
        return;
      }
      render(localMarkdown.content, localMarkdown.name?.replace(/\.(md|markdown)$/i, "") || "Local Markdown");
      resolve();
    });
  });

const load = async () => {
  try {
    const source = params.get("source");
    if (source === "local") {
      await loadLocal();
      return;
    }
    const url = params.get("url");
    if (!url) throw new Error(t("missingMarkdownUrl"));
    await loadFromUrl(url);
  } catch (error) {
    setMessage(error.message || t("loadFailed"), true);
  }
};

reloadButton.addEventListener("click", load);
printButton.addEventListener("click", openPrintDialog);

load();
