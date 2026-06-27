/// <reference types="vite/client" />

declare module '*.js';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_USE_LOCAL_BLOG_API?: string;
  readonly VITE_USE_LOCAL_ASK_API?: string;
  readonly VITE_USE_LOCAL_DEMO_API?: string;
  readonly VITE_USE_LOCAL_PAYMENT_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
