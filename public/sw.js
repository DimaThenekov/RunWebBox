// Карта каналов для связи с клиентами
const clientChannels = new Map();

self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Игнорируем запросы к другим доменам
  if (url.origin !== location.origin) {
    return;
  }

  // Игнорируем запросы к /RunWebBox и сам service worker
  if (path.startsWith('/RunWebBox') || path.includes('sw.js')) {
    return;
  }

  // Обрабатываем все остальные запросы через главный поток
  event.respondWith(handleFetchViaMainThread(event));
});

self.addEventListener('message', event => {
  const { type } = event.data;
  const ports = event.ports;

  if (type === 'REGISTER_CLIENT' && ports && ports.length > 0) {
    const port = ports[0];
    const clientId = self.crypto.randomUUID();

    console.log('Registering client:', clientId);

    // Сохраняем порт для связи
    clientChannels.set(clientId, port);

    // Настраиваем обработчики сообщений
    port.onmessage = msgEvent => {
      const { type, requestId, payload } = msgEvent.data;

      if (type === 'FETCH_RESPONSE') {
        // Находим pending promise и разрешаем его
        const pendingRequest = pendingRequests.get(requestId);
        if (pendingRequest) {
          pendingRequest(payload);
          pendingRequests.delete(requestId);
        }
      }
    };

    port.onmessageerror = error => {
      console.error('Message error from client:', error);
    };

    // Удаляем канал при отключении
    port.addEventListener('close', () => {
      clientChannels.delete(clientId);
    });

    // Отправляем подтверждение регистрации
    port.postMessage({
      type: 'CLIENT_REGISTERED',
      clientId,
    });
  }
});

// Карта ожидающих запросов
const pendingRequests = new Map();

async function handleFetchViaMainThread(event) {
  await self.clients.get(event.clientId);
  //if (!client) {
  //  return new Response('Client not found', { status: 404 });
  //}

  // Ищем активный канал связи
  const channels = Array.from(clientChannels.entries());
  if (channels.length === 0) {
    return new Response('No client channels available', { status: 503 });
  }

  // Берем первый доступный канал
  const [clientId, port] = channels.at(-1);
  const requestId = self.crypto.randomUUID();

  return new Promise(resolve => {
    // Сохраняем callback для разрешения promise
    pendingRequests.set(requestId, response => {
      const { response: body, status, headers, error } = response;

      if (error) {
        resolve(new Response(error, { status: 500 }));
        return;
      }

      resolve(
        new Response(body, {
          status: status || 200,
          headers: {
            'Content-Type': headers?.contentType || 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
      );
    });

    // Отправляем запрос в главный поток
    port.postMessage({
      type: 'FETCH_REQUEST',
      requestId,
      payload: {
        url: event.request.url,
        path: new URL(event.request.url).pathname,
        method: event.request.method,
      },
    });

    // Таймаут на случай если ответ не придет
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        resolve(new Response('Request timeout', { status: 504 }));
      }
    }, 10000);
  });
}
