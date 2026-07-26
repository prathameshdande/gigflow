let loadPromise = null;

/**
 * Loads Razorpay's hosted checkout script once and caches the promise,
 * so repeated calls (e.g. re-opening the payment modal) don't inject the
 * script tag more than once.
 */
export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
};
