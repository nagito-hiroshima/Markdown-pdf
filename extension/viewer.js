const titleEl = document.getElementById("documentTitle");
const contentEl = document.getElementById("content");
const messageEl = document.getElementById("message");
const tocEl = document.getElementById("tocList");
const reloadButton = document.getElementById("reloadButton");
const printButton = document.getElementById("printButton");
const errorPanel = document.getElementById("errorPanel");
const errorTitle = document.getElementById("errorTitle");
const errorDescription = document.getElementById("errorDescription");
const errorUrl = document.getElementById("errorUrl");
const errorDetails = document.getElementById("errorDetails");
const retryButton = document.getElementById("retryButton");
const openOtherButton = document.getElementById("openOtherButton");
const helpButton = document.getElementById("helpButton");
const params = new URLSearchParams(location.search);

const setMessage = (message, isError = false) => {
  messageEl.textContent = message || "";
  messageEl.classList.toggle("error", isError);
};
const titleFromUrl = (url) => {
  try { const parsed = new URL(url); return decodeURIComponent((parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname).replace(/\.(md|markdown)$/i, "")); }
  catch { return "Markdown Document"; }
};
const openPrintDialog = () => window.print();

const sendMessage = (message) => new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));

const errorMessageKey = (code) => ({
  INVALID_URL: "errorInvalidUrl", UNSUPPORTED_URL: "errorUnsupportedUrl", NETWORK_ERROR: "errorNetwork",
  TIMEOUT: "errorTimeout", HTTP_ERROR: "errorHttp", NOT_FOUND: "errorNotFound", ACCESS_DENIED: "errorAccessDenied",
  NOT_MARKDOWN: "errorNotMarkdown", TOO_LARGE: "errorTooLarge"
}[code] || "loadFailed");

const showError = (result, url) => {
  contentEl.textContent = "";
  tocEl.innerHTML = `<span class="empty">${t("noHeadings")}</span>`;
  setMessage("");
  errorPanel.hidden = false;
  errorTitle.textContent = t("errorTitle");
  errorDescription.textContent = t(errorMessageKey(result?.errorCode));
  errorUrl.textContent = url || t("missingMarkdownUrl");
  errorDetails.textContent = JSON.stringify(result || {}, null, 2);
};

const render = (markdown, title) => {
  const parsed = MarkdownPdf.parse(markdown);
  titleEl.textContent = title || "Markdown Document";
  document.title = `${titleEl.textContent} - Markdown PDF Viewer`;
  contentEl.innerHTML = parsed.html;
  tocEl.innerHTML = parsed.toc.length ? parsed.toc.map((item) => `<a class="level-${item.level}" href="#${item.id}">${item.text}</a>`).join("") : `<span class="empty">${t("noHeadings")}</span>`;
  errorPanel.hidden = true;
  setMessage("");
  if (params.get("print") === "1") setTimeout(openPrintDialog, 250);
};

const loadFromUrl = async (url) => {
  titleEl.textContent = titleFromUrl(url);
  setMessage(t("loadingMarkdown"));
  const validation = UrlUtils.validateMarkdownUrl(url);
  if (!validation.ok) return showError(validation, url);
  const result = await sendMessage({ type: "fetchMarkdown", url: validation.url });
  if (!result?.ok) return showError(result, url);
  render(result.markdown, titleFromUrl(result.finalUrl || validation.url));
};

const loadLocal = () => new Promise((resolve, reject) => {
  chrome.storage.local.get("localMarkdown", ({ localMarkdown }) => {
    if (!localMarkdown?.content) return reject(new Error(t("localMarkdownMissing")));
    render(localMarkdown.content, localMarkdown.name?.replace(/\.(md|markdown)$/i, "") || "Local Markdown"); resolve();
  });
});

const load = async () => {
  try {
    const source = params.get("source");
    if (source === "local") return await loadLocal();
    const url = params.get("url");
    if (!url) return showError({ errorCode: "INVALID_URL" }, "");
    await loadFromUrl(url);
  } catch (error) { showError({ errorCode: "NETWORK_ERROR", message: error.message }, params.get("url") || ""); }
};

reloadButton.addEventListener("click", load);
retryButton.addEventListener("click", load);
printButton.addEventListener("click", openPrintDialog);
openOtherButton.addEventListener("click", () => location.href = chrome.runtime.getURL("onboarding.html"));
helpButton.addEventListener("click", () => location.href = chrome.runtime.getURL("onboarding.html"));
load();
