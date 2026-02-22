import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      // Dès que l'URL commence par /api, Vite l'envoie vers ngrok !
      '/api': {
        target: 'https://tuberless-acrimoniously-marquis.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }

});