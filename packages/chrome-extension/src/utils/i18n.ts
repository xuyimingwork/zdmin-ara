export function i18n(...args: Parameters<typeof chrome.i18n.getMessage>): ReturnType<typeof chrome.i18n.getMessage> {
  return chrome.i18n.getMessage(...args)
}