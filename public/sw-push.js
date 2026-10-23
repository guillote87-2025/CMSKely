// Service Worker for Kayleen Magazine Web Push Notifications
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Kayleen Magazine',
    body: 'Nueva publicación disponible en el blog.',
    icon: '/images/kayleen/author-150x150.jpg',
    url: '/',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/images/kayleen/author-150x150.jpg',
    badge: '/images/kayleen/author-150x150.jpg',
    image: payload.imageUrl || undefined,
    data: {
      url: payload.url || '/',
      articleId: payload.targetArticleId || null,
    },
    vibrate: [120, 60, 120],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetArticleId = event.notification.data?.articleId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (targetArticleId) {
            client.postMessage({
              type: 'KAYLEEN_OPEN_ARTICLE_FROM_PUSH',
              articleId: targetArticleId,
            });
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
