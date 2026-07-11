import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) return "three";
            if (id.includes("react-dom") || id.includes("scheduler")) return "react-dom";
            if (id.includes("react-router")) return "router";
            if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul")) return "radix";
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (id.includes("react-hook-form") || id.includes("zod")) return "forms";
            if (id.includes("lucide-react")) return "icons";
          }
        },
      },
    },
  },
}));
