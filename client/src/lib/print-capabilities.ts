/**
 * iPadOS browsers identify as iPad/iPhone, or as a touch-enabled Mac when
 * desktop websites are requested. Chrome on iPad uses the same WebKit browser
 * engine, so the user-agent brand alone is not a reliable capability check.
 */
export function isAppleMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIOSDevice = /iPad|iPhone|iPod|CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
  const isIPadDesktopMode = platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isIOSDevice || isIPadDesktopMode;
}
