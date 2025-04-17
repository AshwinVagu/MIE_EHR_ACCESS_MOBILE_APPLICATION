// /imports/utils/cache.js
import localforage from 'localforage';

localforage.config({
  name: 'HealthApp',
  storeName: 'bundle_cache',
});

/**
 * Attempts network fetch. If offline or network fails, falls back to cache.
 * @param {string} key - unique cache key
 * @param {Function} fetchFn - async function to call the server
 * @returns {Promise<any>} - either fresh or cached data
 */
export async function fetchWithOfflineFallback(key, fetchFn) {
  const online = Meteor.status().connected;

  console.log("Network status:", online ? "Online" : "Offline");

  if (online) {
    try {
      const data = await fetchFn();
      // Update cache on successful network fetch
      await localforage.setItem(key, { data, timestamp: Date.now() });
      return { data, isOffline: false };
    } catch (e) {
      console.warn("Network fetch failed, trying cache:", e.message);
      const cached = await localforage.getItem(key);
      return { data: cached?.data ?? null, isOffline: true };
    }
  } else {
    const cached = await localforage.getItem(key);
    return { data: cached?.data ?? null, isOffline: true };
  }
}

/**
 * Manually clear cache
 */
export async function clearCache(key) {
  return localforage.removeItem(key);
}
