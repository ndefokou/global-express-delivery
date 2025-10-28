import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Global Express Delivery",
        short_name: "GlobalExpress",
        description: "Système de gestion des livraisons",
        theme_color: "#ffffff",
        icons: [
          {
            src: "global-express-delivery.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "global-express-delivery.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "global-express-delivery.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
