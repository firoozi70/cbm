/*
 * Service Worker - ماشین‌حساب بار و CBM
 * راهبرد:
 *  - صفحات (navigation): network-first با fallback به کش (پشتیبانی آفلاین)
 *  - استاتیک‌های Next (/_next/static): cache-first (نام‌های هش‌دار و تغییرناپذیر)
 *  - فونت‌ها و آیکون‌ها: cache-first
 *  - API و بقیه: فقط شبکه
 */
const VERSION = "v1";
const CACHE_NAME = `cbm-app-${VERSION}`;
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, "/manifest.json"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // فقط same-origin
  if (url.origin !== self.location.origin) return;

  // درخواست‌های ناوبری (صفحه)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // استاتیک‌های هش‌دار Next و فونت‌ها: cache-first
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    /\.(woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
  // بقیه (API و ...) فقط شبکه
});
