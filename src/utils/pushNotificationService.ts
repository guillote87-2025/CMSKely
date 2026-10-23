import { PushNotificationItem } from '../data/akeaData';

const PUSH_ENABLED_STORAGE_KEY = 'kayleen_browser_push_enabled_v1';
const PUSH_READ_IDS_STORAGE_KEY = 'kayleen_browser_push_read_ids_v1';

export type BrowserPushPermissionState = 'granted' | 'denied' | 'default' | 'simulated_iframe';

export function isBrowserPushSubscribedLocal(): boolean {
  try {
    const saved = localStorage.getItem(PUSH_ENABLED_STORAGE_KEY);
    if (saved === null) {
      // Enable by default for demo experience so subscribers immediately see push alerts
      localStorage.setItem(PUSH_ENABLED_STORAGE_KEY, 'true');
      return true;
    }
    return saved === 'true';
  } catch {
    return true;
  }
}

export function setBrowserPushSubscribedLocal(enabled: boolean): void {
  try {
    localStorage.setItem(PUSH_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function getReadPushIdsLocal(): string[] {
  try {
    const raw = localStorage.getItem(PUSH_READ_IDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markPushIdsAsReadLocal(ids: string[]): void {
  try {
    const existing = new Set(getReadPushIdsLocal());
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(PUSH_READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(existing)));
  } catch {
    // Ignore
  }
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw-push.js');
    return registration;
  } catch {
    return null;
  }
}

export async function requestBrowserPushPermission(): Promise<{
  subscribed: boolean;
  permissionState: BrowserPushPermissionState;
}> {
  setBrowserPushSubscribedLocal(true);

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { subscribed: true, permissionState: 'simulated_iframe' };
  }

  try {
    if (Notification.permission === 'granted') {
      await registerPushServiceWorker();
      return { subscribed: true, permissionState: 'granted' };
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await registerPushServiceWorker();
        return { subscribed: true, permissionState: 'granted' };
      }
      // In cross-origin sandboxed iframes, browsers often auto-deny or ignore requestPermission.
      // We fall back to our in-browser push engine so the subscriber still receives real-time push alerts.
      return { subscribed: true, permissionState: 'simulated_iframe' };
    }

    return { subscribed: true, permissionState: 'simulated_iframe' };
  } catch {
    return { subscribed: true, permissionState: 'simulated_iframe' };
  }
}

export function playSubtlePushChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio context restrictions
  }
}

export async function dispatchNativeBrowserNotification(
  notification: PushNotificationItem,
  siteName = 'Kayleen Magazine',
  onClickArticle?: (articleId: string) => void
): Promise<void> {
  if (!isBrowserPushSubscribedLocal()) return;

  playSubtlePushChime();

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const title = notification.title || `${siteName} · Nueva Alerta`;
  const options: NotificationOptions = {
    body: notification.body,
    icon: notification.imageUrl || '/images/kayleen/author-150x150.jpg',
    tag: notification.id,
    data: {
      targetArticleId: notification.targetArticleId,
    },
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, options);
        return;
      }
    }
    const nativeNotif = new Notification(title, options);
    nativeNotif.onclick = () => {
      window.focus();
      if (notification.targetArticleId && onClickArticle) {
        onClickArticle(notification.targetArticleId);
      }
      nativeNotif.close();
    };
  } catch {
    // Fallback handled by in-browser floating Push Notification UI
  }
}
