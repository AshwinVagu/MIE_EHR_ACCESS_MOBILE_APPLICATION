// /imports/utils/cache.js
import localforage from 'localforage';
import { checkInternetConnectivity } from "./network.js";

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
  
  const online = await checkInternetConnectivity();

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
    if (window.plugins && window.plugins.toast) {
      window.plugins.toast.showWithOptions(
        {
          message: "Network Offline! Fetching data from Offline storage.",
          duration: "short", 
          position: "bottom",
        },
        () => {}, // Success callback
        (err) => console.error("Toast failed", err) // Error callback
      );
    } else {
      console.error("Cordova toast plugin not available.");
    }
    return { data: cached?.data ?? null, isOffline: true };
  }
}

/**
 * Manually clear cache
 */
export async function clearCache(key) {
  return localforage.removeItem(key);
}
