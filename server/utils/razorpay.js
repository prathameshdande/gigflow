const Razorpay = require("razorpay");

let instance = null;

/**
 * Lazily creates a single shared Razorpay client. Lazy (not at module
 * load time) so a missing key doesn't crash the whole server on boot -
 * it only errors when someone actually tries to take a payment, with a
 * clear message pointing at the env vars to set.
 */
const getRazorpay = () => {
  if (instance) return instance;

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const err = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.",
    );
    err.status = 500;
    throw err;
  }

  instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  return instance;
};

module.exports = { getRazorpay };
