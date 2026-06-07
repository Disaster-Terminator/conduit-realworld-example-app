import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: resolve(__dirname, "frontend/src/setupTests.js"),
    css: true,
  },
});
