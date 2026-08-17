import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          d3: ["d3"],
          reactVendor: ["react", "react-dom", "react-router-dom"],
          reduxVendor: ["@reduxjs/toolkit", "react-redux"],
          icons: ["lucide-react", "react-icons"],
        },
      },
    },
  },
});
