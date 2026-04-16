declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function track(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', eventName, params ?? {});
}
