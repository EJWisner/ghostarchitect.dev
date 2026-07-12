// Ghost Pulse service worker — handles Web Push notifications for new
// support drafts and escalations. Registered from pulse-x7k2m9.html.
// No caching/offline behavior here; this worker exists solely for push.

const PULSE_URL = '/pulse-x7k2m9.html';

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = {};
  }

  const title = data.title || 'Ghost Support';
  const options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'ghost-support',
    data: { url: data.url || `https://ghostarchitect.dev${PULSE_URL}` },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    || `https://ghostarchitect.dev${PULSE_URL}#support-body`;

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url.includes(PULSE_URL) && 'focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            await client.navigate(targetUrl.includes('#') ? targetUrl : `${targetUrl}#support-body`);
          }
          return;
        }
      }
      await self.clients.openWindow(targetUrl.includes('#') ? targetUrl : `${targetUrl}#support-body`);
    })()
  );
});
