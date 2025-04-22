export async function checkInternetConnectivity(pingUrl = "https://www.google.com/generate_204") {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); 

    const response = await fetch(pingUrl, {
      method: "GET",
      mode: "no-cors", 
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return true; 
  } catch (err) {
    return false; 
  }
}
