self.addEventListener('push', (event: any) => {
  const data = event.data?.json() ?? {};
  (event as any).waitUntil(
    (self as unknown as any).registration.showNotification(data.title ?? 'Pasbem Saúde', {
      body:     data.body  ?? '',
      icon:     '/aplicativo/icon-512x512.png',
      tag:      data.tag   ?? 'pasbem',
      renotify: true,
      data: { url: data.url ?? '/aplicativo/home' },
    })
  );
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  (event as any).waitUntil(
    (self as unknown as any).clients
      .openWindow(event.notification.data?.url ?? '/aplicativo/home')
  );
});