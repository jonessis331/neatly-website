import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      // Allow Stripe fonts and resources
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' data: https://fonts.gstatic.com https://js.stripe.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.supabase.co wss://*.supabase.co;
        frame-src https://js.stripe.com https://hooks.stripe.com;
        object-src 'none';
        base-uri 'self';
      `
        .replace(/\s+/g, " ")
        .trim(),
    },
  },
});
