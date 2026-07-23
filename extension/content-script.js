const isMarkdownPage = () => UrlUtils.isGithubMarkdownBlobUrl(location.href) || UrlUtils.isGithubRawMarkdownUrl(location.href);
const toRawUrl = () => UrlUtils.githubBlobToRawUrl(location.href);

const openViewer = ({ print = false } = {}) => {
  chrome.runtime.sendMessage({ type: "openViewer", url: toRawUrl(), print });
};

const makeButton = (label, className, onClick) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
};

const message = (key) => chrome.i18n.getMessage(key) || key;

const addToolbar = () => {
  if (!isMarkdownPage() || document.querySelector(".mpv-page-toolbar")) return;
  const toolbar = document.createElement("div");
  toolbar.className = "mpv-page-toolbar";
  const title = document.createElement("span");
  title.className = "mpv-page-toolbar-title";
  title.textContent = "Markdown PDF Viewer";
  const openButton = makeButton(message("openPdfButton"), "mpv-page-toolbar-button primary", () => openViewer());
  const printButton = makeButton(message("printButton"), "mpv-page-toolbar-button", () => openViewer({ print: true }));
  toolbar.append(title, openButton, printButton);
  (location.hostname === "raw.githubusercontent.com" ? document.body : document.querySelector("main") || document.body).prepend(toolbar);
};

addToolbar();
new MutationObserver(addToolbar).observe(document.documentElement, { childList: true, subtree: true });
