const isGithubMarkdownBlob = () => {
  const parts = location.pathname.split("/").filter(Boolean);
  return location.hostname === "github.com" && parts[2] === "blob" && /\.(md|markdown)$/i.test(location.pathname);
};

const isRawMarkdown = () =>
  location.hostname === "raw.githubusercontent.com" && /\.(md|markdown)$/i.test(location.pathname);

const isMarkdownPage = () => isGithubMarkdownBlob() || isRawMarkdown();

const toRawUrl = () => {
  if (isRawMarkdown()) return location.href;
  const parts = location.pathname.split("/").filter(Boolean);
  const [owner, repo, , branch, ...path] = parts;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path.join("/")}`;
};

const openViewer = ({ print = false } = {}) => {
  chrome.runtime.sendMessage({
    type: "openViewer",
    url: toRawUrl(),
    print
  });
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

  if (isRawMarkdown()) {
    document.body.prepend(toolbar);
    return;
  }

  const target = document.querySelector("main") || document.body;
  target.prepend(toolbar);
};

addToolbar();
new MutationObserver(addToolbar).observe(document.documentElement, { childList: true, subtree: true });
