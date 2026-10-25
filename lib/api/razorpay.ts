let checkoutScriptPromise: Promise<void> | null = null;

export function loadRazorpayCheckout(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout can only be loaded in a browser.'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;

  checkoutScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve();
      else reject(new Error('Razorpay Checkout loaded without its browser API.'));
    };
    script.onerror = () => reject(new Error('Razorpay Checkout script could not be loaded.'));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    checkoutScriptPromise = null;
    throw error;
  });

  return checkoutScriptPromise;
}
