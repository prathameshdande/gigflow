/**
 * Resilient fetch utility that automatically retries transient errors
 * such as cloud/Render cold starts, MongoDB Atlas connection spin-up,
 * network hiccups, and 502/503/504 Bad Gateway / Gateway Timeout errors.
 */
export async function fetchWithRetry(
  url,
  options = {},
  retries = 4,
  baseDelay = 1200,
) {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, options);

      // Transient 5xx server errors (e.g. 502/503/504 while server/DB is waking up)
      if (res.status >= 500 && attempt < retries) {
        attempt++;
        const delay = baseDelay * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return res;
    } catch (err) {
      // AbortError is intentional (e.g. user typed a new search or unmounted)
      if (err.name === "AbortError") {
        throw err;
      }

      if (attempt < retries) {
        attempt++;
        const delay = baseDelay * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }
}
