import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://10.128.2.194:8000",
        //target: "https://no-throwam-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
