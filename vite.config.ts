import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        // target: 'http://172.17.0.1:8000',
        target: "https://no-throwam-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
