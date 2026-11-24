const scope = new URL(self.registration.scope);

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const path = url.pathname.slice(scope.pathname.length);
  const isAppPage = /^(?:$|login\/?$|registro\/?$|verificar-identidad\/?$|ciudadano\/|operador\/|admin\/)/.test(path);

  // Only handle page navigations. Requests for API data and evidence pass through the browser.
  if (request.method !== 'GET' || request.mode !== 'navigate' ||
      url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname) || !isAppPage) {
    return;
  }

  event.respondWith(fetch(request).catch(() => new Response(
    `<!doctype html>
    <html lang="es">
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>AMPAR · Conexión no disponible</title>
      <main>
        <h1>Conexión no disponible</h1>
        <p>Si necesitas ayuda inmediata, comunícate por teléfono con el servicio de emergencias.</p>
        <p><a href="">Volver a intentar abrir AMPAR</a></p>
      </main>
    </html>`,
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )));
});
