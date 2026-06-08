import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: fileURLToPath(
      new URL("frontend/src/setupTests.js", import.meta.url),
    ),
    css: true,
  },
});
