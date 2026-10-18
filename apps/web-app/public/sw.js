// ProbStreet Progressive Web App (PWA) Service Worker
const CACHE_NAME = 'probstreet-v1.0.0';
const STATIC_ASSETS = [
	'/',
	'/index.html',
	'/manifest.json',
	'/favicon.ico',
	'/logo.png',
	'/icons/icon-192x192.png',
	'/icons/icon-512x512.png',
	'/icons/apple-touch-icon.png',
];

// Install: Cache critical shell assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}),
	);
	self.skipWaiting();
});

// Activate: Clean up outdated caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				}),
			);
		}),
	);
	self.clients.claim();
});

// Fetch: Smart caching strategy
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// 1. NEVER cache API requests, WebSockets, or POST/DELETE mutations
	if (
		url.pathname.startsWith('/api') ||
		url.pathname.startsWith('/capi') ||
		url.pathname.startsWith('/aapi') ||
		event.request.method !== 'GET'
	) {
		return;
	}

	// 2. Navigation (HTML): Network-first with offline cache fallback
	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request).catch(() => {
				return caches.match('/index.html') || caches.match('/');
			}),
		);
		return;
	}

	// 3. Static Assets (/assets/ bundles, fonts, images): Cache-first with network fallback
	if (
		url.pathname.startsWith('/assets/') ||
		url.pathname.startsWith('/icons/') ||
		url.pathname.endsWith('.png') ||
		url.pathname.endsWith('.svg') ||
		url.pathname.endsWith('.ico') ||
		url.pathname.endsWith('.avif') ||
		url.pathname.endsWith('.woff2')
	) {
		event.respondWith(
			caches.match(event.request).then((cached) => {
				if (cached) return cached;
				return fetch(event.request).then((response) => {
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}
					const toCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
					return response;
				});
			}),
		);
		return;
	}

	// 4. Everything else: Network-first
	event.respondWith(
		fetch(event.request).catch(() => {
			return caches.match(event.request);
		}),
	);
});
