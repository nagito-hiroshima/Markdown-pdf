const isAllowedMarkdownUrl = (value) => {
  try {
    const url = new URL(value);
    const isHttp = url.protocol === "https:" || url.protocol === "http:";
    const isMarkdown = /\.(md|markdown)$/i.test(url.pathname);
    return isHttp && isMarkdown;
  } catch {
    return false;
  }
};

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "openViewer" || !isAllowedMarkdownUrl(message.url)) return;

  const viewerUrl = new URL(chrome.runtime.getURL("viewer.html"));
  viewerUrl.searchParams.set("source", "url");
  viewerUrl.searchParams.set("url", message.url);
  if (message.print) viewerUrl.searchParams.set("print", "1");

  chrome.tabs.create({ url: viewerUrl.toString() });
});
