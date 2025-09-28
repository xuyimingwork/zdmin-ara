export function reload(url: string) {
  return chrome.tabs.query({ active: true, lastFocusedWindow: true, currentWindow: true })
    .then(([tab]) => {
      if ((tab?.url === url)) return chrome.tabs.reload().then(() => tab)
      return chrome.tabs.update(undefined, { url });
    })
}