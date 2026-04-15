
export const FB_PIXEL_ID = (import.meta as any).env.VITE_FB_PIXEL_ID || '3089946627750677';

export const initPixel = () => {
  if (!FB_PIXEL_ID || typeof window === 'undefined') return;

  // Standard Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  (window as any).fbq('init', FB_PIXEL_ID);
  (window as any).fbq('track', 'PageView');
};

export const trackEvent = (eventName: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, options);
  }
};

export const trackCustom = (eventName: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, options);
  }
};

export const identifyUser = (email: string, name?: string) => {
  if (typeof window !== 'undefined' && (window as any).fbq && FB_PIXEL_ID) {
    // Re-init with user data for Advanced Matching
    (window as any).fbq('init', FB_PIXEL_ID, {
      em: email.toLowerCase().trim(),
      fn: name?.split(' ')[0]?.toLowerCase().trim(),
      ln: name?.split(' ').slice(1).join(' ')?.toLowerCase().trim()
    });
  }
};
