/* eslint-disable require-jsdoc */
/* eslint-disable no-restricted-globals */
// Thanks tint

function fetchThenCache(request) {
	return fetch(request).then((res) => {
		// cache successful requests
		if (res.ok) {
			return caches.open('music-level-studio')
				.then((cache) => cache.add(request))
			// ignore errors here, the request was still successful
				.catch(() => {})
				.then(() => res);
		}

		return res;
	});
}

async function tryCacheFetch(event) {
	const matchRes = await caches.match(event.request);
	if (matchRes !== undefined) return matchRes;
	return fetchThenCache(event.request);
}

const cachedExtensions = ['.js', '.mp3', '.png', '.jpeg', '.jpg', '.webp'];

self.addEventListener('fetch', (event) => {
	// resources served from the same folder as the service worker should be cached
	if (
		event.request.method !== 'GET'
        || !event.request.url.startsWith(self.location.href.replace(/\/[^/]+$/, '/'))
	) {
		return;
	}

	const path = event.request.url.replace(self.location.href.replace(/\/[^/]+$/, '/'), '/');

	// Always use cached js or mp3 files since their filenames change on revision
	// Also, png, jpeg, jpg, and webp because of cloud storage bandwidth
	// Always try to download otherwise. When offline, always use cache.
	if (!hasCachedExtension(path)) {
		event.respondWith(
			fetchThenCache(event.request).catch(() => caches.match(event.request)),
		);
	} else {
		event.respondWith(tryCacheFetch(event));
	}
});

/**
 * Determines if the resource has an extension that would make it load cache-first.
 * @param {string} path The path to the resource to fetch.
 * @returns {boolean} Whether or not there was a match.
 */
function hasCachedExtension(path) {
	for (let i = 0; i < cachedExtensions.length; i++) {
		const ext = cachedExtensions[i];
		if (path.endsWith(ext)) return true;
	}
	return false;
}
